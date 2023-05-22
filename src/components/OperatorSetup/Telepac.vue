<template>
  <div>
    <div class="fr-upload-group">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden />
      <span class="fr-error-text" v-if="erreur">{{ erreur }}</span>
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
          Le <b>fichier de parcelles déclarées {{ télépac.campagne }}</b> se récupère en quelques clics
          sur le <a :href="télépac.urls.home" target="_blank">portail Telepac</a> :
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
                <a :href="télépac.urls.home" class="fr-text--bold" target="_blank">Dossier PAC {{ télépac.campagne }}</a>
              </li>

              <li class="fr-mb-2w">
                dans l'onglet bleu <b>Import/export</b>,
                sélectionnez le menu
                <a :href="télépac.urls.exportHome" class="fr-text--bold" target="_blank">Export îlots et parcelles</a>
              </li>

              <li class="fr-mb-2w">
                cliquez sur le lien
                <a :href="télépac.urls.exportShapefile" target="_blank">
                  <b>Parcelles déclarées {{ télépac.campagne }}</b> : Fichier de parcelles
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
import { ref } from 'vue'
import { convertShapefileArchiveToGeoJSON } from '@/cartobio-api.js'
import { useTélépac } from '@/referentiels/pac.js'

const emit = defineEmits(['upload:start', 'upload:complete'])
const télépac = useTélépac()

const fileInput = ref(null)
const source = 'telepac'
const erreur = ref('')

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  try {
    const geojson = await convertShapefileArchiveToGeoJSON(archive)
    emit('upload:complete', { geojson, source })
  } catch (error) {
    if (error.response?.status === 500) {
      erreur.value = 'Le fichier sélectionné ne semble pas être un fichier de déclaration PAC valide.'
    }

    erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
  }
}
</script>
