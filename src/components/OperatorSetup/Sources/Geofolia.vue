<template>
  <div>
    <div v-if="erreur" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Échec de l'import</h3>
      <p>{{ erreur }}</p>
    </div>

    <form @submit.prevent="handleSubmit" role="search" id="import-geofolia-form" v-if="isStaging">
      <h3 class="fr-h5">Plate-forme Geofolink</h3>

      <p>
        La plate-forme Geofolink facilite le partage des données avec CartoBio si vous en donnez votre consentement.<br />
        Cette connexion est basée sur votre SIRET, à savoir <code>{{ operator.siret }}</code>.
      </p>

      <p v-if="hasCloudAccount === null">
        <Spinner v-if="isLoading">Vérification de votre contrat</Spinner>
      </p>
      <div class="fr-input-group" v-else>
        <Spinner v-if="isLoading">Collecte des parcelles en cours</Spinner>
        <button class="fr-btn" type="submit" :disabled="!canImportFromCloud" v-else>Collecter les parcelles</button>
      </div>

      <div class="fr-alert fr-alert--info" v-if="!canImportFromCloud">
        <h3 class="fr-alert__title">Comment activer la liaison Geofolink avec CartoBio ?</h3>

        <p>
          Consultez la page <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-geofolia" target="_blank">Import Geofolia</a>
          de notre documentation pour une aide illustrée et pas à pas.
        </p>
      </div>
    </form>

    <hr class="fr-my-3w" v-if="isStaging" />

    <h3 class="fr-h5">Export manuel</h3>

    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip" @change="handleFileUpload" hidden>

      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner mon fichier "Parcelles et interventions (ZIP)"
      </button>
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
import { computed, inject, onMounted, readonly, ref } from 'vue'
import { convertGeofoliaArchiveToGeoJSON, checkGeofoliaAccountStatus, getOperatorGeofoliaFeatures } from '@/cartobio-api.js'
import { sources } from "@/referentiels/imports.js"

import Spinner from '@/components/Spinner.vue'

const emit = defineEmits(['upload:start', 'upload:complete'])

// file import
const fileInput = ref(null)
const erreur = ref('')

// API import
const isStaging = computed(() => !import.meta.env.VUE_APP_PRODUCTION)
const operator = inject('operator')

const isLoading = ref(false)
const hasCloudAccount = ref(null)
const canImportFromCloud = computed(() => operator.siret && hasCloudAccount.value === true)

async function handleSubmit () {
  emit('upload:start')
  isLoading.value = true
  erreur.value = ''

  try {
    const geojson = await getOperatorGeofoliaFeatures(operator.numeroBio)

    if (!geojson) {
      erreur.value = 'Les données ne sont pas encore prêtes. Veuillez réessayer dans 2 ou 3 minutes.'
      return
    }

    emit('upload:complete', { geojson, source: sources.GEOFOLIA, warnings: [], metadata: {} })
  } catch (error) {
    erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
    throw error
  }
  finally {
    isLoading.value = false
  }
}

async function handleFileUpload () {
  const [archive] = fileInput.value.files
  erreur.value = ''
  emit('upload:start')

  try {
    const geojson = await convertGeofoliaArchiveToGeoJSON(archive)

    emit('upload:complete', { geojson, source: sources.GEOFOLIA, warnings: [], metadata: {} })
  } catch (error) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      erreur.value = 'Votre fichier n\'est pas reconnu comme un export Geofolia.'
    } else {
      erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
      throw error
    }
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    await checkGeofoliaAccountStatus(operator.numeroBio)
    hasCloudAccount.value = true
  }
  catch (error) {
    hasCloudAccount.value = false
  }
  finally {
    isLoading.value = false
  }
})
</script>
