<template>
  <div>
    <div class="fr-upload-group">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden />

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Importer ma dernière déclaration PAC
      </button>
    </div>

    <hr class="fr-mt-5w fr-mb-3w" />

    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend fr-icon fr-icon-questionnaire-line">
        Où télécharger le fichier de ma dernière déclaration PAC ?
      </legend>

      <div class="fr-fieldset__content">
        <p>
          Le <b>fichier de parcelles déclarées {{ campagnePacAnnee }}</b> se récupère en quelques clics
          sur le <a href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a> :
        </p>

        <div class="fr-grid-row">
          <div class="fr-col-5">
            <ol class="fr-list">
              <li class="fr-mb-2w">
                connectez-vous avec vos identifiants Télépac
              </li>

              <li class="fr-mb-2w">
                dans l'encart <b>Téléprocédures</b>,
                sélectionnez l'entrée
                <a :href="campagnePacUrl" class="fr-text--bold" target="_blank">Dossier PAC {{ campagnePacAnnee }}</a>
              </li>

              <li class="fr-mb-2w">
                dans l'onglet bleu <b>Import/export</b>,
                sélectionnez le menu
                <a :href="campagnePacExportUrl" class="fr-text--bold" target="_blank">Export îlots et parcelles</a>
              </li>

              <li class="fr-mb-2w">
                cliquez sur le lien
                <a :href="campagnePacExportShapefileUrl" target="_blank">
                  <b>Parcelles déclarées {{ campagnePacAnnee }}</b> : Fichier de parcelles
                </a>
              </li>

              <li class="fr-mb-2w">
                <button class="fr-btn fr-icon-upload-line fr-btn--icon-left fr-mb-2w" @click="fileInput.click()">
                  Importer ma dernière déclaration PAC
                </button>
                <br />

                <span class="fr-icon fr-icon-info-fill">
                  le fichier téléchargé se trouve dans votre <b>répertoire "Téléchargements"</b>.
                </span>
              </li>
            </ol>

            <p>

            </p>
          </div>

          <div class="fr-col-7">
            <p>
              <img src="/import/capture_ecran_telepac_accueil.png" class="fr-responsive-img fr-ratio-4x3 screenshot"
                alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
            </p>

            <p>
              <img src="/import/capture_ecran_telepac_export.png" class="fr-responsive-img fr-ratio-4x3 screenshot"
                alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
            </p>
          </div>
        </div>

        <a href="#top" class="fr-mt-5w fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-left fr-icon-arrow-up-fill">
          retour en haut de page
        </a>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { ref, computed, readonly, toRef } from 'vue'
import axios from 'axios'
import { statsPush } from '@/stats.js'
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
  const { data: geojson } = await axios.post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>
