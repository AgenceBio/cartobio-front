<template>
  <section class="operator-setup-flow">
    <div class="fr-stepper" v-if="withStepper">
      <h2 class="fr-stepper__title">
        <span class="fr-stepper__state">Étape {{ currentStep.index }} sur {{ allSteps.length }}</span>
        {{ currentStep.title }}
      </h2>
      <div class="fr-stepper__steps" :data-fr-current-step="currentStep.index" :data-fr-steps="allSteps.length"></div>
      <p class="fr-stepper__details" v-if="nextStep">
        <span class="fr-text--bold">Étape suivante&nbsp;:</span> {{ nextStep.title }}
      </p>
    </div>

    <slot name="introduction" v-if="isStep('intro')" />

    <div class="fr-grid-row fr-grid-row--gutters" v-if="isStep('intro')">
      <div class="fr-col-md-6 fr-col-lg-4" v-for="{ id, selector } in actions" :key="id">
        <Component :is="selector" :operator="operator" @select="handleFlowSelection(id)" @submit="handleUpload"  @save="handleUploadAndSave" />
      </div>
    </div>

  <Component :is="currentFlowComponent" :operator="operator" @submit="handleUpload" v-else-if="isStep('setup')" />
  <PreviewStep :featureCollection="featureCollection" :warnings="warnings" @submit="handlePreviewConfirmation" @cancel="resetFlow" v-else-if="isStep('preview')" />
  <OutroStep @submit="handleRedirection" @cancel="resetFlow" v-else-if="isStep('outro')" />

    <p v-if="(!flowId && !isStep('intro')) || (flowId && !isStep('setup') && !isStep('outro'))">
      <button class="fr-btn fr-btn--secondary" @click="resetFlow">
        Recommencer l'import
      </button>
    </p>
  </section>
</template>

<script setup>
import { computed, markRaw, readonly, ref, shallowRef, unref } from 'vue'

import PreviewStep from '@/components/OperatorSetup/Preview.vue'
import OutroStep from '@/components/OperatorSetup/Outro.vue'

import { useRecordStore } from '@/stores/index.js'
import { createOperatorRecord } from '@/cartobio-api.js'

const recordStore = useRecordStore()

const emit = defineEmits(['error', 'upload', 'submit', 'redirect'])
const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  flowId: {
    type: String,
    required: false
  },
  operator: {
    type: Object,
    required: true
  },
  withStepper: {
    type: Boolean,
    default: false
  }
})

const currentFlowId = ref(props.flowId)
const featureCollection = shallowRef(null)
const metadata = shallowRef(null)
const record = shallowRef(null)
const warnings = ref([])

const allSteps = readonly([
  { key: 'intro', title: 'Bienvenue sur CartoBio', condition: () => true },
  { key: 'setup', title: 'Choix des données géographiques', condition: () => currentFlowId.value },
  { key: 'preview', title: 'Prévisualisation', condition: () => featureCollection.value },
  { key: 'outro', title: 'Accéder au parcellaire', condition: () => record.value?.metadata && 'source' in record.value.metadata },
])

const currentStep = computed(() => [...allSteps].reverse().find(({ condition }) => condition())?.key ?? allSteps.at(0).key)
const nextStep = computed(() => {
  const currentStepIndex = allSteps.findIndex(({ key }) => key === currentStep.value)
  return currentStepIndex + 1 < allSteps.length ? allSteps[currentStepIndex.value + 1] : null
})
const isStep = (stepId) => currentStep.value === stepId

const currentFlowComponent = computed(() => {
  const flow = props.actions.find(({ id }) => id === currentFlowId.value)

  return flow && flow?.wizzard ? markRaw(flow.wizzard) : null
})

function resetFlow () {
  currentFlowId.value = props.flowId
  recordStore.update({ parcelles: { type: 'FeatureCollection', features: [] } })
  featureCollection.value = null
  metadata.value = null
}

function handleFlowSelection (flowId) {
  currentFlowId.value = flowId
}

function handleUpload ({ geojson, metadata: data, source, warnings: warns }) {
  featureCollection.value = geojson
  warnings.value = warns
  metadata.value = {
    ...data,
    provenance: window.location.host,
    source
  }

  emit('upload', { geojson, metadata: unref(metadata), warnings: warns })
}

async function handlePreviewConfirmation () {
  const { numeroBio } = props.operator

  record.value = await createOperatorRecord(numeroBio, {
    geojson: featureCollection.value,
    metadata: metadata.value
  })

  emit('submit', unref(record.value))
}

async function handleUploadAndSave ({ geojson, metadata, source }) {
  const { numeroBio } = props.operator

  record.value = await createOperatorRecord(numeroBio, {
    geojson,
    metadata: {
      ...metadata,
      provenance: window.location.host,
      source
    }
  })

  emit('submit', unref(record.value))
}

function handleRedirection () {
  recordStore.update(record.value)

  emit('redirect', unref(record.value))
}
</script>
