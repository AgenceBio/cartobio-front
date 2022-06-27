<template>
  <div class="fr-tabs">
      <ul class="fr-tabs__list" role="tablist">
        <li v-for="(source, sourceId) in featureSources" role="presentation" :key="sourceId">
          <button class="fr-tabs__tab" :disabled="!source.component" type="button" :aria-selected="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
        </li>
      </ul>

      <Component :is="featureSources[featureSource].component" @upload:start="emit('import:start')" @upload:complete="handleUpload" :class="{ 'fr-tabs__panel': true, 'fr-tabs__panel--selected': true }" role="tabpanel" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { submitParcelles } from '../../cartobio-api.js'

import featureSources from '../../components/OperatorSetup/index.js'
import store from '../../store.js'

const emit = defineEmits(['import:start', 'import:complete', 'error'])
const featureSource = ref(store.state.parcellaireSource ?? 'telepac')

defineExpose({ featureSource })

async function handleUpload ({ geojson, source }) {
  try {
    await submitParcelles(geojson, { source })
    emit('import:complete', { geojson, source })
  }
  catch (error) {
    emit('error', error)
  }
}
</script>
