<template>
  <div class="py-3">
    <section class="px-3">
      <p class="d-flex red--text text--darken-3 font-weight-bold" v-if="isSupposedToHaveParcels">
        <v-icon color="red darken-3" class="mr-3">warning</v-icon>
        Désolé, nous n'avons pas trouvé de parcelles en {{ baseYear }}
        pour cet opérateur.
      </p>
      <p class="d-flex font-weight-bold" v-else-if="operator.numeroPacage">
        <v-icon class="mr-3">help_outline</v-icon>
        Les parcelles de cet opérateur ne nous ont pas été communiquées.
      </p>

      <v-subheader class="text--cyan">Renseigner le parcellaire</v-subheader>

      <p class="body-1 grey--text text--darken-2">
        Renseignez le parcellaire de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}
        ({{ operator.title }}), et nous les intégrerons à CartoBio.
      </p>
    </section>

    <v-expansion-panel elevation-0>
      <v-expansion-panel-content>
        <template v-slot:header>
          <h3 class="subheading">Saisie libre</h3>
        </template>

        <v-form class="pa-3">
          <v-textarea v-model="freeText" outline full-width counter rows="10" />

          <v-btn round color="#b9d065" @click="sendEmail" :disabled="!freeText || isProcessing" :loading="isProcessing">
            Transmettre
          </v-btn>
        </v-form>
      </v-expansion-panel-content>


        <v-expansion-panel-content>
          <template v-slot:header>
            <h3 class="subheading">Téléchargement de fichier</h3>
          </template>

          <v-form class="pa-3">
            <v-input prepend-icon="attach_file" :messages="uploadMessages">
              <input type="file" ref="uploads" @change="processFiles" multiple>
            </v-input>


            <v-btn round color="#b9d065" @click="sendEmail" :disabled="uploads.length === 0 || isProcessing" :loading="isProcessing">
              Transmettre
            </v-btn>
          </v-form>
        </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import {post} from 'axios';

const {VUE_APP_API_ENDPOINT} = process.env;

export default {
  name: "OperatorSidebarParcelsSubmit",
  props: {
    operator: Object,
  },

  data () {
    return {
      isValid: false,
      isProcessing: false,
      freeText: '',
      uploads: []
    }
  },

  methods: {
    processFiles () {
      const uploadsP = Array.from(this.$refs.uploads.files).map(file => new Promise((resolve) => {
        const reader = new FileReader()

        reader.addEventListener('load', () => {
          resolve({
            content: reader.result,
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

    isSupposedToHaveParcels () {
      const baseDate = new Date(this.baseDate)
      const referenceDate = new Date(this.operator.dateEngagement || this.operator.dateMaj)

      return this.operator.numeroPacage && (baseDate >= referenceDate)
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .v-subheader {
  padding-left: 0;
  text-transform: uppercase;
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
