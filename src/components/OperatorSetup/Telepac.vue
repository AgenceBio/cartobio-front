<template>
  <div>
    <!-- <article>
          <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
            🔐 Connecter mon compte TelePAC
          </button>
        </article> -->
    <div class="fr-alert fr-alert--info fr-mb-5w">
      <p class="fr-alert__title">Remarque</p>
      <p>
        Le nom du fichier ressemble à
        <code>Dossier-PAC-{{ campagnePacAnnee }}_parcelle-{{ campagnePacAnnee }}_{{ currentUser.numeroPacage }}_….zip</code>.
      </p>
    </div>

    <div class="fr-upload-group">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden />

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Importer ma dernière déclaration PAC
      </button>
    </div>


    <details class="fr-my-5w">
      <summary class="fr-icon-questionnaire-line fr-btn fr-btn--secondary fr-btn--icon-left">Où trouver mon fichier ?
      </summary>

      <p>
        Le fichier <b>Parcelles déclarées {{ campagnePacAnnee }} › Fichier de parcelles</b> se trouve sur le <a
          href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a>,
        dans la <a :href="campagnePacUrl" target="_blank">téléprocédure <b>Dossier PAC {{ campagnePacAnnee }}</b></a>,
        dans l'onglet bleu "Import/export" puis <a :href="campagnePacExportUrl" target="_blank">Export îlots et
          parcelles</a>.
      </p>
      <p>
        <img src="/import/telepac-export.png" class="screenshot"
          alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
      </p>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { post } from 'axios'
import { statsPush } from '../../pages/stats.js'
import store from '../../store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const emit = defineEmits(['upload:start', 'upload:complete'])
const currentUser = toRef(store.state, 'currentUser')

const campagnePacAnnee = ref(2021)
const campagnePacAnneeShort = computed(() => String(campagnePacAnnee.value).slice(-2))
const campagnePacUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/auth/accueilTas.action?campagne=${campagnePacAnnee.value}&titreApplication=Dossier+PAC+${campagnePacAnnee.value}`)
const campagnePacExportUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpIlots.action`)

const fileInput = ref(null)
const source = 'telepac'

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>
