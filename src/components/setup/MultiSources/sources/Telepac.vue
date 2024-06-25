<template>
  <div>
    <h3 class="fr-sr-only">Import Telepac</h3>

    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip,.xml" @change="handleFileUpload" hidden />
      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner ma dernière déclaration PAC
      </button>
    </div>

    <div v-if="erreur" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Échec de l'import</h3>
      <p>{{ erreur }}</p>
    </div>

    <div class="fr-alert fr-alert--info">
      <h3 class="fr-alert__title">Où récupérer le fichier demandé ?</h3>

      <p>
        Consultez la page <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-de-la-declaration-pac" target="_blank">import de la déclaration PAC<lien-externe /></a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { convertTelepacFileToGeoJSON } from '@/cartobio-api.js'
import { useTélépac } from '@/referentiels/pac.js'

const emit = defineEmits(['upload:start', 'upload:complete'])

const { campagne: currentCampagne } = useTélépac()
const fileInput = ref(null)
const source = 'telepac'
const erreur = ref('')

async function handleFileUpload () {
  const warnings = []
  const [archive] = fileInput.value.files

  emit('upload:start')

  try {
    const geojson = await convertTelepacFileToGeoJSON(archive)
    const metadata = {
      campagne: geojson.features.at(0)?.properties?.CAMPAGNE,
      pacage: geojson.features.at(0)?.properties?.PACAGE,
    }

    if (parseInt(metadata.campagne, 10) < currentCampagne.value) {
      warnings.push(`Le fichier contient des données datant de la campagne ${metadata.campagne}. Peut-être disposez-vous d'un export plus récent, par exemple de la campagne ${currentCampagne.value} ?`)
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
