<template>
  <div>
    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden>

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Importer mes parcelles et interventions
      </button>
    </div>

    <div class="fr-alert fr-alert--info">
      <h3 class="fr-alert__title">Où récupérer le fichier demandé ?</h3>

      <p>
        Consultez la page <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-geofolia" target="_blank">Import Géofolia</a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const fileInput = ref(null)

const emit = defineEmits(['upload:start', 'upload:complete'])
const source = 'geofolia'

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/convert/geofolia/geojson`, form)

  emit('upload:complete', { geojson, source })
}
</script>
