<template>
  <div>
    <div v-if="errors.length" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Erreur</h3>
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="fr-input-group">
        <label for="ncvi-evv" class="fr-label">
          Numéro d'Exploitation Viti-Vinicole (EVV)
          <span class="fr-hint-text">Votre numéro EVV est communément appelé numéro CVI (pour <i>Casier Viticole Informatisé</i>). </span>
        </label>

        <div class="fr-input-wrap">
          <input type="text" class="fr-input" id="ncvi-evv" v-model="operatorEvvNumber" :disabled="isDisabled" ref="inputRef" required />
        </div>
      </div>

      <p>
        <a href="#" class="fr-link" rel="noopener" target="_blank">Où trouver mon numéro EVV ?</a>
      </p>

      <div class="fr-input-group">
        <Spinner v-if="isLoading">Collecte des parcelles en cours</Spinner>
        <button class="fr-btn" v-else>Collecter les parcelles</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, unref } from 'vue'
import { getOperatorNcviFeatures } from '@/cartobio-api.js'
import { applyCadastreGeometries } from '@/components/Features/index.js'

import Spinner from '@/components/Spinner.vue'

const emit = defineEmits(['upload:start', 'upload:complete'])
const source = 'ncvi'
const errors = ref([])
const inputRef = ref(null)
const isLoading = ref(false)

const operatorEvvNumber = ref('')
const isDisabled = computed(() => false)

async function handleSubmit () {
  emit('upload:start')
  isLoading.value = true

  try {
    const evv = unref(operatorEvvNumber)
    const baseCollection = await getOperatorNcviFeatures(evv)
    const { featureCollection: geojson, warnings } = await applyCadastreGeometries(baseCollection)

    emit('upload:complete', { geojson, source, warnings, metadata: { source, evv } })
  } catch (error) {
    console.error(error)
    return errors.value = ['Erreur inconnue, merci de réessayer plus tard.']
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => inputRef.value.focus())
</script>
