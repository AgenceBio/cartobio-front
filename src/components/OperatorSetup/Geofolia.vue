<template>
  <div>
    <div class="fr-alert fr-alert--info fr-mb-5w">
      <p class="fr-alert__title">Remarque</p>
      <p>Le nom du fichier ressemble à <code>…_Parcelles et Interventions (ZIP)_….zip</code>.</p>
    </div>

    <div class="fr-upload-group">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden>

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Importer mes parcelles et interventions
      </button>
    </div>


    <details class="fr-my-5w">
      <summary class="fr-icon-questionnaire-line fr-btn fr-btn--secondary fr-btn--icon-left">Où trouver mon fichier ?
      </summary>

      <p>
        Le fichier <b>Parcelles et interventions (ZIP)</b> se trouve dans l'onglet "Export › Parcelles et interventions"
        du logiciel Géofolia, édité par Isagri.
      </p>

      <p>
        <img src="/import/geofolia-export.png" class="screenshot"
          alt="Écran Export Parcelles et interventions du logiciel Géofolia" />
      </p>
    </details>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
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
  const { data: geojson } = await axios.post(`${VUE_APP_API_ENDPOINT}/v1/convert/geofolia/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>
