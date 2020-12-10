<template>
  <v-form class="px-3" ref="form" v-model="isValid" v-if="!isSaved">

    <h2 class="subheading text--cyan">Ajouter une parcelle</h2>

    <h3 class="body-2 mt-2">1. Références cadastrales</h3>

    <p class="body-1" v-if="!hasCadastralReferences">
      Sélectionnez une ou plusieurs parcelles cadastrales sur la carte.
    </p>
    <p class="body-1 grey--text text--darken-2" v-else>
      Continuez à sélectionner des sections cadastrales, ou renseignez les informations de culture.
    </p>

    <div v-if="hasCadastralReferences">
      <ul class="parcels-list pl-3 py-2">
        <li v-for="feature in parcel.cadastralReferences" :key="feature.id">
          Section&nbsp;<strong>{{ feature.properties.section }}</strong>, parcelle&nbsp;<strong>{{ feature.properties.numero }}</strong>
          <span class="pl-1 grey--text text--darken-1">({{ beautifyNumber(feature.properties.contenance / 10000) }}ha)</span>
        </li>
      </ul>

      <p>
        Soit un <strong>total</strong> de
        <strong>{{ beautifyNumber(totalSurface) }}</strong> hectares.
      </p>
    </div>

    <section>
      <h3 class="body-2 mt-2">2. Culture</h3>

      <p class="body-1 grey--text text--darken-2" v-if="!hasCadastralReferences">
        <v-icon small color="grey--text text--darken-2">info</v-icon>
        Les champs suivants seront modifiables après sélection d'au moins une référence cadastrale.
      </p>

      <v-autocomplete :rules="[rules.required]" :disabled="!hasCadastralReferences" dense :items="knownCultures" label="Type de culture" prepend-icon="search" item-text="Libellé Culture" item-value="Code Culture" v-model="parcel.culturalCode" />

      <v-select :rules="[rules.required]" :disabled="!hasCadastralReferences" :items="conversionStatuses" prepend-icon="list" label="Statut de la conversion" v-model="parcel.conversionStatus" />

      <v-menu v-model="conversionDateMenu"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="320px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field :rules="[isBio && rules.required]" v-on="on" clearable readonly :disabled="!hasCadastralReferences || parcel.conversionStatus === CONVENTIONNEL" v-model="parcel.conversionDate" label="Date de conversion" prepend-icon="event" />
        </template>
        <v-date-picker @input="conversionDateMenu = false" type="month" v-model="parcel.conversionDate" show-current locale="fr-FR" />
      </v-menu>

      <v-menu v-model="observationDateMenu"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="320px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field :rules="[rules.required]" v-on="on" clearable readonly :disabled="!hasCadastralReferences" v-model="parcel.observationDate" label="Informations relevées en date du…" prepend-icon="event" />
        </template>
        <v-date-picker @input="observationDateMenu = false" v-model="parcel.observationDate" show-current locale="fr-FR" />
      </v-menu>

      <h3 class="body-2">3. Commentaire libre</h3>

      <p class="body-1 grey--text text--darken-2">
        Ce contenu sera relu et pris en compte par l'équipe CartoBio.
      </p>

      <v-textarea v-model="freeText" outline full-width counter rows="5" />
    </section>

    <v-btn round class="mx-auto" color="#b9d065" @click="sendEmail" :disabled="!isValid || !hasCadastralReferences || isProcessing" :loading="isProcessing">
      Transmettre
    </v-btn>
  </v-form>

  <v-flex v-else class="grow text-sm-center my-5">

    <v-icon size="128" color="green">check_circle</v-icon>

    <p class="body-2 my-3">Nouvelle parcelle transmise, merci !</p>

    <p class="body-1 my-2">Elle sera affichée sur CartoBio sous 48h&nbsp;ouvrées.</p>

    <v-btn round outline class="mt-5 mb-2" @click="isSaved = false">Ajouter une autre parcelle</v-btn>
    <v-btn round color="#b9d065" :to="{ path: `/map/exploitation/${operator.numeroBio}` }">Retourner à la liste des parcelles</v-btn>
  </v-flex>
</template>

<script>
import {mapMutations, mapState, mapActions} from 'vuex';
import combine from '@turf/combine';
import {post} from 'axios';
import {codes} from '@/modules/codes-cultures/pac.js';
const {VUE_APP_API_ENDPOINT} = process.env;

const STATUS_CONVENTIONNEL = '0'
const STATUS_BIO_C1        = 'C1'
const STATUS_BIO_C2        = 'C2'
const STATUS_BIO_C3        = 'C3'
const STATUS_BIO_AB        = '1'

export default {
  name: "OperatorSidebarParcelsSubmit",
  props: {
    operator: Object,
  },

  data () {
    return {
      conversionDateMenu: false,
      observationDateMenu: false,

      // form data
      parcel: {
        conversionStatus: null,
        culturalCode: null,
        conversionDate: null,
        observationDate: null,
        cadastralReferences: []
      },
      freeText: '',

      // form state
      isSaved: false,
      isValid: false,
      isProcessing: false,

      rules: {
        required: value => !!value || 'Ce champ est obligatoire.',
      },

      // form selection values
      CONVENTIONNEL: STATUS_CONVENTIONNEL,

      conversionStatuses: [
        { value: STATUS_CONVENTIONNEL,  text: 'Conventionnel' },
        { value: STATUS_BIO_C1, text: 'Conversion 1ère année' },
        { value: STATUS_BIO_C2, text: 'Conversion 2ème année' },
        { value: STATUS_BIO_C3, text: 'Conversion 3ème année' },
        { value: STATUS_BIO_AB,   text: 'Certifié AB' },
      ],

      knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture'])),
    }
  },

  mounted () {
    this.makeCadastreSelectable()
    this.trackEvent(["operator", "add-parcel", "state:start"])

    this._unsubscribeFromStore = this.$store.subscribe((mutation) => {
      if (mutation.type === 'map/FEATURE_TOGGLE' && mutation.payload.source === 'cadastre') {
        const foundIndex = this.parcel.cadastralReferences.findIndex(({id}) => id === mutation.payload.feature.id)

        if (foundIndex === -1) {
          this.parcel.cadastralReferences.push(Object.freeze(mutation.payload.feature))
        }
        else {
          this.$set(this.parcel, 'cadastralReferences', this.parcel.cadastralReferences.filter((feature, index) => index !== foundIndex))
        }
      }
    })
  },

  beforeDestroy() {
    this.unsetFeatures()
    this.makeCadastreUnselectable()
    this._unsubscribeFromStore()
  },

  methods: {
    ...mapMutations('map', ['makeCadastreSelectable', 'makeCadastreUnselectable']),
    ...mapActions("user", ["trackEvent"]),

    beautifyNumber (number) {
      return number.toLocaleString('fr', {
        style: 'decimal',
        maximumFractionDigits: 2
      })
    },

    unsetFeatures () {
      this.parcel.cadastralReferences.forEach(feature => {
        this.$store.commit('map/FEATURE_TOGGLE', {
          state: { selected: false },
          feature: JSON.parse(JSON.stringify(feature)),
          source: feature.source,
          sourceLayer: feature.sourceLayer
        })
      })

      this.parcel.cadastralReferences = []
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
        text: this.freeText,
        uploads: this.uploads,
        sender: {
          userId,
          userEmail,
          userName,
          ocId,
        }
      }, options).then(() => {
        this.freeText = ''
        this.unsetFeatures()
        this.$refs.form.reset()
        this.isSaved = true
        this.trackEvent(["operator", "add-parcel", "state:added"])
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

    isBio () {
      return this.parcel.conversionStatus !== STATUS_CONVENTIONNEL
    },

    hasCadastralReferences () {
      return this.parcel.cadastralReferences.length > 0
    },

    totalSurface () {
      return this.parcel.cadastralReferences.reduce((total, feature) => total + feature.properties.contenance, 0) / 10000
    },

    /**
     * Transform the form into a GeoJSON FeatureCollection
     */
    featureCollection () {
      if (!this.hasCadastralReferences) {
        return null
      }

      const featureCollection = combine(...this.parcel.cadastralReferences)

      featureCollection.features = featureCollection.features.map(feature => ({
        ...feature,
        properties: {
          BIO: this.parcel.conversionStatus,
          CODE_CULTU: this.parcel.culturalCode,
          DATE_CONV: this.parcel.conversionDate,
          DATE_MAJ: this.observationDate
        }
      }))

      return featureCollection
    },

    uploads () {
      const text = JSON.stringify(this.featureCollection, null, 2)
      const blob = new Blob([ text ], { type: 'application/json' })

      return [
        {
            content: btoa(text),
            size: blob.size,
            type: blob.type,
            filename: 'feature.geojson',
            disposition: 'attachment'
          }
      ]
    }
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
