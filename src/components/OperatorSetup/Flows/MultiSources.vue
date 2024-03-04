<template>
  <div class="fr-tabs">
    <p>
      Sélectionner l'outil informatisé qui est au plus proche de la réalité de votre terrain.
      Vous pourrez modifier manuellement votre parcellaire après l'import.
    </p>

    <ul class="fr-tabs__list" role="tablist">
      <li v-for="(source, sourceId) in sourcesTabs" role="presentation" :key="sourceId">
        <button class="fr-tabs__tab" :class="{[`import-source-tab--${sourceId}`]: true}" :disabled="!source.component" type="button" :aria-selected="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
      </li>
    </ul>

    <Component :is="sourcesTabs[featureSource].component" @upload:start="emit('import:start')" @upload:complete="handleSelection" :class="{ 'fr-tabs__panel': true, 'fr-tabs__panel--selected': true }" role="tabpanel" :id="`import-source--${featureSource}`" tabindex="0" />
  </div>
</template>

<script setup>
import { computed, ref, toRaw, unref } from 'vue'

import featureSources, { DEFAULT_SOURCE } from '@/components/OperatorSetup/index.js'

const emit = defineEmits(['submit', 'error'])

const props = defineProps({
  sources: {
    type: Array,
    default: () => ([]),
    validator: (value) => value.every((sourceId) => sourceId in featureSources)
  }
})

const featureSource = ref(DEFAULT_SOURCE)
const sourcesTabs = computed(() => Object.fromEntries(
  props.sources.map(sourceId => ([sourceId, featureSources[sourceId]]))
))

function handleSelection ({ geojson, warnings = [], metadata = {} }) {
  emit('submit', {
    geojson: toRaw(geojson),
    warnings: toRaw(warnings),
    metadata: unref(metadata),
    source: featureSource.value
  })
}
</script>
