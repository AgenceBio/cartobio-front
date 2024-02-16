<template>
  <div>
    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden>

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner mon fichier de parcelles et d'interventions
      </button>
    </div>

    <div v-if="erreur" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Échec de l'import</h3>
      <p>{{ erreur }}</p>
    </div>

    <div class="fr-alert fr-alert--info">
      <h3 class="fr-alert__title">Où récupérer le fichier demandé ?</h3>

      <p>
        Consultez la page <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-geofolia" target="_blank">Import Geofolia</a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { convertGeofoliaArchiveToGeoJSON } from '@/cartobio-api.js'
import { sources } from "@/referentiels/imports.js"

const fileInput = ref(null)

const emit = defineEmits(['upload:start', 'upload:complete'])
const erreur = ref('')

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  emit('upload:start')

  try {
    const geojson = await convertGeofoliaArchiveToGeoJSON(archive)

    emit('upload:complete', { geojson, source: sources.GEOFOLIA, warnings: [], metadata: {} })
  } catch (error) {
    if (error.response?.status >= 400 && error.response?.status <= 500) {
      erreur.value = 'Votre fichier n\'est pas reconnu comme un export Geofolia.'
    } else {
      erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
      throw error
    }
  }
}
</script>
