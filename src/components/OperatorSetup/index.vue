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
import { computed, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import { submitParcellesChanges } from '@/cartobio-api.js'

import { now } from '@/components/dates.js'
import featureSources from '@/components/OperatorSetup/index.js'
import { useUserStore } from '@/stores/user.js'

const emit = defineEmits(['source:change', 'import:start', 'import:complete', 'import:error'])
const props = defineProps({
  trackProvenance: Boolean
})


const featureSource = ref('telepac')
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const provenance = computed(() => props.trackProvenance ? window.location.host : null)

watchEffect(() => emit('source:change', featureSource.value))

defineExpose({ featureSource })

async function handleUpload ({ geojson, source }) {
  try {
    await submitParcellesChanges({
      geojson,
      // @todo ensure this comes from an operator store, and not a user store (userId != operatorId)
      operatorId: user.value.id,
      numeroBio: user.value.numeroBio,
      metadata: {
        source,
        sourceLastUpdate: now(),
        provenance: provenance.value
      }
     })

    emit('import:complete', { geojson, source })
  }
  catch (error) {
    emit('import:error', error)
  }
}
</script>
