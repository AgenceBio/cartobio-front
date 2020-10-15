<template>
  <v-form class="px-3" v-model="isFormValid">
    <h2 class="subheading text--cyan">Ajouter une parcelle</h2>

    <h3 class="body-2 mt-2">1. Références cadastrales</h3>

    <p class="body-1" v-if="!hasCadastralReferences">
      Sélectionnez une ou plusieurs parcelles cadastrales sur la carte.
    </p>
    <p class="body-1 grey--text text--darken-2" v-else>
      Continuez à sélectionner des sections cadastrales, ou renseignez les informations de culture.
    </p>

    <ul class="parcels-list pl-3 py-2" v-if="hasCadastralReferences">
      <li v-for="feature in parcel.cadastralReferences" :key="feature.id">
        Section&nbsp;<strong>{{ feature.properties.section }}</strong>, parcelle&nbsp;<strong>{{ feature.properties.numero }}</strong>
        <span class="pl-1 grey--text text--darken-1">({{ beautifyNumber(feature.properties.contenance / 10000) }}ha)</span>
      </li>
    </ul>

    <section>
      <h3 class="body-2 mt-2">2. Culture</h3>

      <p class="body-1 grey--text text--darken-2" v-if="!hasCadastralReferences">
        <v-icon small color="grey--text text--darken-2">info</v-icon>
        Les champs suivants seront modifiables après sélection d'au moins une référence cadastrale.
      </p>

      <v-autocomplete :rules="[rules.required]" :disabled="!hasCadastralReferences" dense :items="knownCultures" label="Type de culture" prepend-icon="search" item-text="Libellé Culture" item-value="Code Culture" v-model="parcel.culturalCode" />
      <v-select :rules="[rules.required]" :disabled="!hasCadastralReferences" :items="conversionStatuses" prepend-icon="list" label="Statut de la conversion" v-model="parcel.conversionStatus" />
      <v-text-field :disabled="!hasCadastralReferences" label="Année de début de conversion" prepend-icon="event" v-model="parcel.conversionDate" />

      <v-menu v-model="observationDateMenu"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="320px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field :rules="[rules.required]" v-on="on" readonly :disabled="!hasCadastralReferences" v-model="parcel.observationDate" label="Informations relevées en date du…" prepend-icon="event" />
        </template>
        <v-date-picker @input="observationDateMenu = false" v-model="parcel.observationDate" show-current locale="fr-FR" />
      </v-menu>


      <h3 class="body-2">3. Commentaire libre</h3>

      <p class="body-1 grey--text text--darken-2">
        Ce contenu sera relu et pris en compte par l'équipe CartoBio.
      </p>

      <v-textarea v-model="freeText" outline full-width counter rows="5" />

      <v-input prepend-icon="attach_file" :messages="uploadMessages">
        <input type="file" ref="uploads" @change="processFiles" multiple>
      </v-input>
    </section>

    <v-btn round class="mx-auto" color="#b9d065" @click="sendEmail" :disabled="!isFormValid || !hasCadastralReferences || isProcessing" :loading="isProcessing">
      Transmettre
    </v-btn>
  </v-form>
</template>

<script>
import Vue from 'vue'
import {mapMutations, mapState} from 'vuex';
import union from '@turf/union';
import {featureCollection} from '@turf/helpers';
import {post} from 'axios';
import {codes} from '@/modules/codes-cultures/pac.js';
const {VUE_APP_API_ENDPOINT} = process.env;

export default {
  name: "OperatorSidebarParcelsSubmit",
  props: {
    operator: Object,
  },

  data () {
    return {
      conversionDateMenu: false,
      observationDateMenu: false,
      isFormValid: false,

      rules: {
        required: value => !!value || 'Ce champ est obligatoire.'
      },

      parcel: {
        conversionStatus: null,
        culturalCode: null,
        conversionDate: null,
        observationDate: null,
        cadastralReferences: []
      },
      isValid: false,
      isProcessing: false,
      conversionStatuses: [
        { value: '0',  text: 'Conventionnel' },
        { value: 'C1', text: 'Conversion 1ère année' },
        { value: 'C2', text: 'Conversion 2ème année' },
        { value: 'C3', text: 'Conversion 3ème année' },
        { value: '1',   text: 'Certifié AB' },
      ],
      freeText: '',
      uploads: [],

      // eslint-disable-next-line vue/no-reserved-keys
      knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture']))
    }
  },

  mounted () {
    this.makeCadastreSelectable()
    this._unsubscribeFromStore = this.$store.subscribe((mutation) => {
      if (mutation.type === 'map/FEATURE_TOGGLE' && mutation.payload.source === 'cadastre') {
        const foundIndex = this.parcel.cadastralReferences.findIndex(({id}) => id === mutation.payload.feature.id)

        if (foundIndex === -1) {
          this.parcel.cadastralReferences.push(Object.freeze(mutation.payload.feature))
        }
        else {
          Vue.set(this.parcel, 'cadastralReferences', this.parcel.cadastralReferences.filter((feature, index) => index !== foundIndex))
        }
      }
    })
  },

  beforeDestroy() {
    this.makeCadastreUnselectable()
    this._unsubscribeFromStore()
  },

  methods: {
    ...mapMutations('map', ['makeCadastreSelectable', 'makeCadastreUnselectable']),

    beautifyNumber (number) {
      return number.toLocaleString('fr', {
        style: 'decimal',
        maximumFractionDigits: 2
      })
    },

    processFiles () {
      const uploadsP = Array.from(this.$refs.uploads.files).map(file => new Promise((resolve) => {
        const reader = new FileReader()

        reader.addEventListener('load', () => {
          resolve({
            // we are interested by the content stripped of its data URI prefix
            content: reader.result.replace(/^data:.+;base64,/, ''),
            size: file.size,
            type: file.type,
            filename: file.name,
            disposition: 'attachment'
          })
        })

        reader.readAsDataURL(file)
      }))

      Promise.all(uploadsP).then(uploads => this.uploads = uploads)
    },

    sendEmail () {
      const {numeroBio} = this.operator
      const {apiToken} = this
      const {email:userEmail, id:userId, nom:userName, ocId} = this.userProfile
      const options = {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      }

      this.isProcessing = true

      post(`${VUE_APP_API_ENDPOINT}/v1/parcels/operator/${numeroBio}`, {
        text: [
          this.freeText,
          '```json\n' + JSON.stringify(this.featureCollection, null, 2) + '\n```'
        ].join("\n\n"),
        uploads: this.uploads,
        sender: {
          userId,
          userEmail,
          userName,
          ocId,
        }
      }, options).then(() => {
        this.freeText = ''
        this.$refs.uploads.form.reset()
        this.uploads = []
      }, console.error).finally(() => {
        this.isProcessing = false
      })
    }
  },

  computed: {
    ...mapState('user', ['apiToken']),
    ...mapState(['userProfile']),
    ...mapState({
      baseDate: state => state.lastDataUpdate,
      baseYear: state => new Date(state.lastDataUpdate).getFullYear(),
    }),

    hasCadastralReferences () {
      return this.parcel.cadastralReferences.length > 0
    },

    /**
     * Transform the form into a GeoJSON FeatureCollection
     */
    featureCollection () {
      if (!this.hasCadastralReferences) {
        return null
      }

      const mergedFeature = union(...this.parcel.cadastralReferences)

      mergedFeature.properties = {
        BIO: this.parcel.conversionStatus,
        CODE_CULTU: this.parcel.culturalCode,
        DATE_CONV: this.parcel.conversionDate,
        DATE_MAJ: this.observationDate
      }

      return featureCollection([mergedFeature])
    },

    uploadMessages () {
      const stats = this.uploads.reduce((total, attachment) => {
        total.count++
        total.filesize += attachment.size
        return total
      }, { count: 0, filesize: 0 })

      return stats.count
        ? [`Total à envoyer : ${(stats.filesize / 1024 / 1024).toFixed(2)}Mo`]
        : []
    },
  }
};
</script>
<style lang="scss" scoped>
/deep/ .v-subheader {
  padding-left: 0;
  text-transform: uppercase;
}

.parcels-list {
  list-style: decimal;
}

.subheading {
  font-weight: bold;
}

.text--cyan {
  color : #457382;
}

.v-btn {
  margin: 0;
}

section {
  text-align: left;
}
</style>
