<template>
  <div>
    <div class="fr-upload-group">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden />

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Importer ma dernière déclaration PAC
      </button>
    </div>

    <fieldset class="fr-fieldset fr-my-5w">
      <legend class="fr-fieldset__legend fr-icon fr-icon-questionnaire-line">
        Où trouver mon fichier ?
      </legend>

      <div class="fr-fieldset__content">
        <p>
          Le fichier <b>Fichier de parcelles déclarées {{ campagnePacAnnee }}</b> se récupère en quelques clics
          sur le <a href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a> :
        </p>

        <ol class="fr-list">
          <li>
            connectez-vous avec vos identifiants Télépac
          </li>

          <li>
            sélectionnez l'entrée
            <a :href="campagnePacUrl" class="fr-text--bold" target="_blank">Dossier PAC {{ campagnePacAnnee }}</a>
            dans l'encart <b>Téléprocédures</b>

            <img src="/import/capture_ecran_telepac_accueil.png" class="fr-responsive-img fr-ratio-4x3 screenshot"
            alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
          </li>

          <li>
            sélectionnez le menu
            <a :href="campagnePacExportUrl" class="fr-text--bold" target="_blank">Export îlots et parcelles</a>
            dans l'onglet bleu <b>Import/export</b>

            <img src="/import/capture_ecran_telepac_export.png" class="fr-responsive-img fr-ratio-4x3 screenshot"
            alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
          </li>

          <li>
            cliquez sur le lien
            <a :href="campagnePacExportShapefileUrl" target="_blank">
              <b>Parcelles déclarées {{ campagnePacAnnee }}</b> : Fichier de parcelles
            </a>
          </li>
        </ol>

        <a href="#top" class="fr-mt-5w fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-left fr-icon-arrow-up-fill">
          retour en haut de page
        </a>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { ref, computed, readonly, toRef } from 'vue'
import { post } from 'axios'
import { statsPush } from '../../pages/stats.js'
import store from '../../store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const emit = defineEmits(['upload:start', 'upload:complete'])
const currentUser = toRef(store.state, 'currentUser')

const campagnePacAnnee = ref(2022)
const campagnePacAnneeShort = computed(() => String(campagnePacAnnee.value).slice(-2))
const campagnePacUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/auth/accueilTas.action?campagne=${campagnePacAnnee.value}&titreApplication=Dossier+PAC+${campagnePacAnnee.value}`)
const campagnePacExportUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpIlots.action`)
const campagnePacExportShapefileUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpFichierParcelles.action?anneeCampagne=${campagnePacAnnee.value}`)
const campagnePacExportXmlUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportDossierCourant.action`)

const fileInput = ref(null)
const source = 'telepac'

const helpSteps = readonly([
  { label: 'Je me connecte à Télépac' },
  { label: `Téléprocédure Dossier PAC ${campagnePacAnnee.value}` },
  { label: 'Onglet Import/export' },
  { label: 'Téléchargement du fichier' },
])

const currentStepIndex = ref(0)
const nextStepIndex = computed(() => currentStepIndex.value < helpSteps.length ? currentStepIndex.value + 1 : currentStepIndex.value)

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>

<style scoped>
img.screenshot {
  max-width: 650px;
}
</style>
