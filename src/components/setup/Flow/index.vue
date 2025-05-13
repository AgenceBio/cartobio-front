<template>
  <section class="operator-setup-flow">
    <div class="fr-stepper" v-if="withStepper && currentStep.withStepper">
      <h2 class="fr-stepper__title">
        <span class="fr-stepper__state">Étape {{ displayedStepIndex + 1 }} sur {{ displayedStep.length }}</span>
        {{ currentStep.title }}
      </h2>
      <div
        class="fr-stepper__steps"
        :data-fr-current-step="displayedStepIndex + 1"
        :data-fr-steps="displayedStep.length"
      ></div>
      <p class="fr-stepper__details" v-if="nextStep">
        <span class="fr-text--bold">Étape suivante&nbsp;:</span> {{ nextStep.title }}
      </p>
    </div>
    <div class="fr-stepper" v-else>
      <h2 class="fr-stepper__title">
        {{ currentStep.title }}
      </h2>
    </div>

    <slot name="introduction" v-if="isStep('intro')" />

    <div class="fr-grid-row fr-grid-row--gutters" v-if="isStep('intro')">
      <div class="fr-col-md-6 fr-col-lg-4" v-for="{ id, selector } in actions" :key="id">
        <Component
          :is="selector"
          @select="handleFlowSelection(id)"
          @submit="handleUpload"
          @save="handleUploadAndSave"
        />
      </div>
    </div>

    <Component
      :is="currentFlow.component"
      v-bind="currentFlow.extraProps"
      @submit="handleUpload"
      :is-loading="isLoading"
      v-else-if="isStep('setup')"
    />
    <PreviewStep
      :featureCollection="featureCollection"
      :warnings="warnings"
      :is-loading="isLoading"
      @submit="handlePreviewConfirmation"
      v-else-if="isStep('preview')"
    />

    <div v-else-if="isStep('end')">
      <section>
        <p>Félicitations, votre parcellaire a été créé sur Cartobio</p>
        <p>Votre organisme de certification y aura accès pour votre audit.</p>
        <p>
          <button class="fr-btn fr-btn--secondary" @click="redirectToCartoBio">
            Accéder à mon parcellaire sur CartoBio
          </button>
        </p>
      </section>
    </div>

    <p
      v-if="
        (!flowId && !isStep('intro') && !isStep('setup') && !isStep('end')) ||
        (flowId && !isStep('setup') && !isStep('end'))
      "
    >
      <button :class="`fr-btn fr-btn--secondary ${currentStep.key}`" :disabled="isLoading" @click="goBack">
        Revenir à l’étape précédente
      </button>
    </p>
    <p v-else-if="isStep('setup') && isOnCartobio">
      <button :class="`fr-btn fr-btn--secondary ${currentStep.key}`" @click="goBack">Retour</button>
    </p>
  </section>
</template>

<script setup>
import { computed, markRaw, provide, readonly, ref, shallowRef, unref } from "vue";

import PreviewStep from "@/components/setup/Flow/Preview.vue";

import { useRecordStore } from "@/stores/record.js";
import { createOperatorRecord, hideNotif } from "@/cartobio-api.js";
import { useRouter } from "vue-router";

const { VUE_APP_API_ENDPOINT } = import.meta.env;

const baseURL = VUE_APP_API_ENDPOINT || "https://cartobio.agencebio.org";

const router = useRouter();
const recordStore = useRecordStore();

const emit = defineEmits(["error", "upload", "submit", "redirect"]);
const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
  flowId: {
    type: String,
    required: false,
  },
  operator: {
    type: Object,
    required: true,
  },
  withStepper: {
    type: Boolean,
    default: false,
  },
});

const currentFlowId = ref(props.flowId);
const featureCollection = shallowRef(null);
const metadata = shallowRef(null);
const record = shallowRef(null);
const warnings = ref([]);
const versionName = ref(null);
const isLoading = ref(false);

const isOnCartobio = new URL(baseURL).origin.includes(window.location.host);

// Provide
provide("operator", props.operator);
provide("importPac", props.operator);
provide("isOnCartobio", isOnCartobio);

const allSteps = readonly([
  { key: "intro", title: "Bienvenue sur CartoBio", condition: () => true, withStepper: false },
  { key: "setup", title: "Choix des données géographiques", condition: () => currentFlowId.value, withStepper: true },
  {
    key: "preview",
    title: props.flowId ? "Récupération des données" : "Prévisualisation",
    condition: () => featureCollection.value,
    withStepper: true,
  },
  {
    key: "end",
    title: "Importation réussie",
    condition: () => !isOnCartobio && record.value != null,
    withStepper: false,
  },
]);

const isStep = (stepId) => currentStep.value.key === stepId;
const currentStepKey = computed(() => [...allSteps].reverse().find(({ condition }) => condition()).key);
const currentStepIndex = computed(() => allSteps.findIndex(({ key }) => key === currentStepKey.value));
const currentStep = computed(() => allSteps.at(currentStepIndex.value));
const displayedStep = computed(() => allSteps.filter((s) => s.withStepper));
const displayedStepIndex = computed(() => displayedStep.value.findIndex(({ key }) => key === currentStep.value.key));
const nextStep = computed(() => {
  return currentStepIndex.value + 1 < allSteps.length ? allSteps[currentStepIndex.value + 1] : null;
});

const currentFlow = computed(() => {
  const flow = props.actions.find(({ id }) => id === currentFlowId.value);
  if (!flow || !flow.wizzard) {
    return { component: null, extraProps: {} };
  } else {
    return { component: markRaw(flow.wizzard), extraProps: { ...(flow?.extraProps ?? {}) } };
  }
});

function goBack() {
  if (isStep("setup")) {
    if (props.flowId) {
      return router.back();
    }
    currentFlowId.value = props.flowId;
  } else if (isStep("preview")) {
    recordStore.update({ parcelles: { type: "FeatureCollection", features: [] } });
    featureCollection.value = null;
    metadata.value = null;
  }
}

function redirect(record) {
  recordStore.update(record);
  emit("redirect", unref(record));
}

function handleFlowSelection(flowId) {
  currentFlowId.value = flowId;
}

function handleUpload({ geojson, metadata: data, source, warnings: warns, versionName: vn }) {
  featureCollection.value = geojson;
  warnings.value = warns;
  metadata.value = {
    ...data,
    provenance: window.location.host,
    source,
    warnings: warns,
  };
  versionName.value = vn;

  emit("upload", { geojson, metadata: unref(metadata), warnings: warns });
}

async function handlePreviewConfirmation(importPrevious, recordId) {
  const { numeroBio } = props.operator;
  isLoading.value = true;
  try {
    record.value = await createOperatorRecord(numeroBio, {
      parcelles: featureCollection.value,
      metadata: metadata.value,
      importPrevious,
      recordId,
      ...(versionName.value !== null && { version_name: versionName.value })
    });
    if (versionName.value !== null) await hideNotif(numeroBio);
  } catch (_e) {
    isLoading.value = false;
    return;
  }

  emit("submit", unref(record.value));

  if (isOnCartobio) {
    redirect(record.value);
  }
}

async function handleUploadAndSave({ geojson, metadata, source }) {
  const { numeroBio } = props.operator;

  record.value = await createOperatorRecord(numeroBio, {
    parcelles: geojson,
    metadata: {
      ...metadata,
      provenance: window.location.host,
      source,
    },
  });

  emit("redirect", unref(record.value));
}

function redirectToCartoBio() {
  redirect(record.value);
}
</script>

<style scoped>
.fr-btn.fr-btn--secondary.setup {
  margin-top: 1rem;
}
</style>
