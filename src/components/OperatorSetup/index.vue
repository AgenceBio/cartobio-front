<template>
  <div class="fr-tabs" v-if="!hasFeatureCollection">
    <p>
      Sélectionner l'outil informatisé qui est au plus proche de la réalité de votre terrain.
    </p>

    <ul class="fr-tabs__list" role="tablist">
      <li v-for="(source, sourceId) in sourcesTabs" role="presentation" :key="sourceId">
        <button class="fr-tabs__tab" :disabled="!source.component" type="button" :aria-selected="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
      </li>
    </ul>

    <Component :is="sourcesTabs[featureSource].component" @upload:start="emit('import:start')" @upload:complete="handleSelection" :class="{ 'fr-tabs__panel': true, 'fr-tabs__panel--selected': true }" role="tabpanel" />
  </div>

  <ImportPreview @submit="handleUpload" @cancel="handleCancel" v-else />
</template>

<script setup>
import { computed, provide, ref, toRaw, unref, watchEffect } from 'vue'

import ImportPreview from '@/components/OperatorSetup/ImportPre.vue'

import { createOperatorRecord } from '@/cartobio-api.js'
import { now } from '@/components/dates.js'
import featureSources from '@/components/OperatorSetup/index.js'
import { useRecordStore } from "@/stores/index.js"

const emit = defineEmits(['source:change', 'import:start', 'import:preview', 'import:complete', 'import:error'])

const props = defineProps({
  sources: {
    type: Array,
    default: () => Object.keys(featureSources),
    validator: (value) => value.every((sourceId) => Object.hasOwn(featureSources, sourceId))
  }
})

const featureSource = ref('telepac')
const featureCollection = ref(null)
const importWarnings = ref([])
const extraMetadata = ref({})

provide('featureSource', featureSource)
provide('featureCollection', featureCollection)
provide('importWarnings', importWarnings)
provide('extraMetadata', extraMetadata)

const { record } = useRecordStore()

const hasFeatureCollection = computed(() => featureCollection.value?.features)
const provenance = computed(() => window.location.host)
const sourcesTabs = computed(() => Object.fromEntries(
  Object.entries(featureSources).filter(([sourceId]) => props.sources.includes(sourceId))
))

watchEffect(() => emit('source:change', featureSource.value))

defineExpose({ featureSource })

function handleSelection ({ geojson, warnings = [], metadata = {} }) {
  featureCollection.value = geojson
  importWarnings.value = warnings
  extraMetadata.value = metadata
  emit('import:preview', { geojson, warnings, metadata })
}

function handleCancel () {
  featureCollection.value = {}
  importWarnings.value = []
  extraMetadata.value = {}
  emit('import:start')
}

async function handleUpload () {
  const { id: operatorId, numeroBio, organismeCertificateur } = record.operator
  const { id: ocId, nom: ocLabel } = organismeCertificateur

  const geojson = toRaw(featureCollection.value)
  const source = toRaw(featureSource.value)

  try {
    const record = await createOperatorRecord(operatorId, {
      geojson,
      ocId,
      ocLabel,
      numeroBio,
      metadata: {
        ...extraMetadata.value,
        source,
        sourceLastUpdate: now(),
        provenance: provenance.value
      }
    })

    emit('import:complete', { geojson, source, record, metadata: unref(extraMetadata) })
  }
  catch (error) {
    emit('import:error', error)
  }
}
</script>
