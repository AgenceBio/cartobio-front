<template>
  <div>
    <h3 class="fr-sr-only">Import par fichier géographique</h3>

    <p>
      Vous pouvez importer un fichier géographique exporté depuis
      CartoBio, le <a href="https://www.geoportail.gouv.fr/" target="_blank" rel="noopener noreferrer">Geoportail<lien-externe /></a>
      ou encore <a href="https://qgis.org" target="_blank" rel="noopener noreferrer">QGIS<lien-externe /></a>.
    </p>

    <p>
      Les formats acceptés sont
        <abbr>KML</abbr> (<code>.kml</code> ou <code>.kmz</code>),
        GeoJSON (<code>.geojson</code>),
        GeoPackage (<code>.gpkg</code>)
        et Shapefile (<code>.shp</code> ou <code>.zip</code>).
    </p>

    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".geojson,.gpkg,.json,.kml,.kmz,.shp,.shp.zip,.zip" @change="handleFileUpload" hidden />
      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner mon fichier
      </button>
    </div>

    <div v-if="erreur" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Échec de l'import</h3>
      <p>{{ erreur }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { convertGeographicalFileToGeoJSON } from '@/cartobio-api.js'

const emit = defineEmits(['upload:start', 'upload:complete'])

const fileInput = ref(null)
const source = 'anygeo'
const erreur = ref('')

async function handleFileUpload () {
  const warnings = []
  const [archive] = fileInput.value.files

  emit('upload:start')

  try {
    const geojson = await convertGeographicalFileToGeoJSON(archive)
    const metadata = {
    }

    emit('upload:complete', { geojson, source, warnings, metadata })
  } catch (error) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      erreur.value = error.response.data.message
    } else {
      erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
      throw error
    }
  }
}
</script>
