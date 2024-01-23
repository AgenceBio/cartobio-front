<template>
  <div>
    <div v-if="errors.length" class="fr-alert fr-alert--error fr-mb-6w">
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="fr-input-group" :class="{'fr-input-group--error': inputError}">
        <label for="ncvi-evv" class="fr-label">
          Numéro d'Exploitation Viti-Vinicole (EVV)
          <span class="fr-hint-text">Votre numéro EVV est communément appelé numéro CVI (pour <i>Casier Viticole Informatisé</i>). </span>
        </label>

        <div class="fr-input-wrap">
          <input type="text" class="fr-input" :class="{'fr-input--error': inputError}" id="ncvi-evv" v-model="operatorEvvNumber" :disabled="isDisabled" ref="inputRef" required />
        </div>

        <p v-if="inputError" class="fr-error-text" v-text="inputError" />
      </div>

      <p>
        <a href="https://www.guide-viticulteur.com/mon-exploitation/je-minstalle/jobtiens-mon-numero-de-cvi-evv-ou-ppm" class="fr-link" rel="noopener" target="_blank">Où trouver mon numéro EVV ?</a>
      </p>

      <div class="fr-input-group">
        <Spinner v-if="isLoading">Collecte des parcelles en cours</Spinner>
        <button class="fr-btn" v-else>Collecter les parcelles</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, unref } from 'vue'
import { getOperatorNcviFeatures } from '@/cartobio-api.js'
import { applyCadastreGeometries } from '@/components/Features/index.js'

import Spinner from '@/components/Spinner.vue'

const emit = defineEmits(['upload:start', 'upload:complete'])
const source = 'ncvi'
const errors = ref([])
const inputError = ref('')
const inputRef = ref(null)
const isLoading = ref(false)

const operator = inject('operator')
const operatorEvvNumber = ref('')
const isDisabled = computed(() => false)

async function handleSubmit () {
  emit('upload:start')
  resetErrors()
  isLoading.value = true

  try {
    const evv = unref(operatorEvvNumber)
    const baseCollection = await getOperatorNcviFeatures({ evv, numeroBio: operator.numeroBio })
    const { featureCollection: geojson, warnings } = await applyCadastreGeometries(baseCollection)

    emit('upload:complete', { geojson, source, warnings, metadata: { source, evv } })
  } catch (error) {
    const { status, data } = error.response

    if (status === 401) {
      inputError.value = data.error
    }
    else if (data.error) {
      errors.value = [data.error]
    }
    else {
      errors.value = ['Le service de ProDouanes est injoignable. Veuillez réessayer plus tard.']
    }
  }
  finally {
    isLoading.value = false
  }
}

function resetErrors () {
  errors.value = []
  inputError.value = ''
}

onMounted(() => inputRef.value.focus())
</script>
