<template>
  <div>
    <!-- <article>
          <button type="button" @click.prevent="$router.push('/exploitation/parcellaire')">
            🔐 Connecter mon compte Isagri Geofolia
          </button>
        </article> -->

    <ul class="fr-raw-list">
      <li class="fr-mb-3w">
        <a :href="VUE_APP_API_ENDPOINT + '/login/geofolia'" class="fr-btn fr-icon-shield-line fr-btn--icon-left">
          Importer à partir de mon compte Géofolia
        </a>
      </li>

      <li>
        <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden>
        <button class="fr-btn fr-btn--secondary fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
          Importer à partir d'un fichier parcelles et interventions
        </button>
      </li>
    </ul>

    <hr class="fr-mt-5w fr-mb-3w" />

    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend fr-icon fr-icon-questionnaire-line">
        Où télécharger le fichier de parcelles et interventions ?
      </legend>

      <div class="fr-fieldset__content">
        <div class="fr-grid-row">
          <div class="fr-col-5">
            <ol class="fr-list">
              <li class="fr-mb-2w">
                cliquez sur l'icône <b>Export</b> du bandeau de menu
              </li>

              <li class="fr-mb-2w">
                sélectionnez <b>Parcelles et interventions</b>,
                puis <b>Parcelles et interventions (ZIP)</b>
              </li>

              <li class="fr-mb-2w">
                <button class="fr-btn fr-btn--secondary fr-icon-upload-line fr-btn--icon-left fr-mb-2w" @click="fileInput.click()">
                  Importer mes parcelles et interventions
                </button>
                <br />

                <span class="fr-icon fr-icon-info-fill">
                  le nom du fichier téléchargé ressemble à<br />
                  <code>…_Parcelles et Interventions (ZIP)_….zip</code>.<br />
                  Il se trouve dans votre <b>répertoire "Téléchargements"</b>.
                </span>
              </li>
            </ol>

            <p>

            </p>
          </div>

          <div class="fr-col-7">
            <p>
              <img src="/import/geofolia-export.png" class="fr-responsive-img fr-ratio-4x3 screenshot"
                alt="Écran Export Parcelles et interventions du logiciel Géofolia" />
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
import { ref, computed } from 'vue'
import { post } from 'axios'
import { statsPush } from '@/stats.js'
import store from '../../store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const fileInput = ref(null)

const emit = defineEmits(['upload:start', 'upload:complete'])
const source = 'geofolia'

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/geofolia/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>
