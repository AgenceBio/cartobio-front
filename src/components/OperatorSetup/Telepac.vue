<template>
  <div>
    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden />
      <span class="fr-error-text" v-if="erreur">{{ erreur }}</span>
      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner ma dernière déclaration PAC
      </button>
    </div>

    <div class="fr-alert fr-alert--info">
      <h3 class="fr-alert__title">Où récupérer le fichier demandé ?</h3>

      <p>
        Consultez la page <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-de-la-declaration-pac" target="_blank">import de la déclaration PAC</a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { convertShapefileArchiveToGeoJSON } from '@/cartobio-api.js'
import { deriveFromFilename, useTélépac } from '@/referentiels/pac.js'

const emit = defineEmits(['upload:start', 'upload:complete'])

const { campagne: currentCampagne } = useTélépac()
const fileInput = ref(null)
const source = 'telepac'
const erreur = ref('')

async function handleFileUpload () {
  const warnings = []
  const [archive] = fileInput.value.files
  const { campagne } = deriveFromFilename(archive?.name)

  emit('upload:start')

  if (campagne !== currentCampagne.value) {
    warnings.push(`Le fichier contient des données datant de la campagne ${campagne}. Peut-être disposez-vous d'un export plus récent, par exemple de la campagne ${currentCampagne.value} ?`)
  }

  try {
    const geojson = await convertShapefileArchiveToGeoJSON(archive)
    emit('upload:complete', { geojson, source, warnings })
  } catch (error) {
    if (error.response?.status === 500 && error.response?.status === 400) {
      erreur.value = 'Le fichier sélectionné ne semble pas être un fichier de déclaration PAC valide.'
    }

    erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
  }
}
</script>
