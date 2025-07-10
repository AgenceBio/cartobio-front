<template>
  <CertificationSection />
  <div class="fr-px-4v">
    <ValidationErrors @switchTab="emit('switch-tab')" />
  </div>
  <hr class="fr-mt-6v" />

  <div class="fr-grid-row fr-grid-row--middle space-between fr-px-4v">
    <h3 class="fr-text--lg fr-mb-0">Parcelles par niveau de conversion</h3>
    <div class="fr-grid-row fr-grid-row--middle infos-parcelles">
      <p class="fr-mb-0">{{ features.length }} parcelles</p>
      <p class="fr-mb-0" v-if="surface">{{ surface }}</p>
    </div>
  </div>
  <div class="carte-container fr-mt-6v">
    <div
      v-for="group in featureGroups"
      :key="group.key"
      class="carte-niveau-conv fr-p-4v"
      @click="selectFeatureGroup(group)"
    >
      <div class="fr-grid-row fr-grid-row--middle space-between fr-mb-6v">
        <p class="fr-mb-0 badge fr-py-1v fr-px-3v" :class="`badge-${getConversionLevel(group.key).shortLabel}`">
          {{ getConversionLevel(group.key).shortLabel }}
        </p>
        <p class="fr-mb-0 fr-text--bold">
          {{
            !isNaN(parseFloat(inHa(legalProjectionSurface(group.features))))
              ? inHa(legalProjectionSurface(group.features)) + " ha"
              : ""
          }}
        </p>
      </div>
      <div class="fr-grid-row align-baseline">
        <p class="fr-mb-0 fr-h2 fr-mr-2v">
          {{ group.features.length }}
        </p>
        <p class="fr-mb-0">Parcelles</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CertificationSection from "@/components/records/CertificationSection.vue";
import ValidationErrors from "./Table/ValidationErrors.vue";
import { getFeatureGroups, GROUPE_NIVEAU_CONVERSION, inHa, legalProjectionSurface } from "@/utils/features";
import { getConversionLevel } from "@/referentiels/ab";
import { useFeaturesStore } from "@/stores/features";

const emit = defineEmits(["switch-tab"]);

const featuresStore = useFeaturesStore();
const { all: features } = featuresStore;

const featureGroups = computed(() => getFeatureGroups({ features }, GROUPE_NIVEAU_CONVERSION, null));

const surface = computed(() =>
  !isNaN(parseFloat(inHa(legalProjectionSurface(features)))) ? inHa(legalProjectionSurface(features)) + " ha" : "",
);

function selectFeatureGroup(group) {
  featuresStore.unselectAll();
  featuresStore.select(...group.features.map((f) => f.id));

  emit("switch-tab", group.pivot);
}
</script>

<style scoped>
.space-between {
  justify-content: space-between;
}

.infos-parcelles {
  gap: 10px;
}

.align-baseline {
  align-items: baseline;
}

.carte-container {
  gap: 14px;
  display: grid;
  grid-template-columns: 50% 50%;
}

.carte-niveau-conv {
  border: 1px solid var(--blue-france-950-100);
  border-bottom-width: 4px;
  cursor: pointer;
}

.carte-niveau-conv:hover {
  border-bottom-width: 1px;
  margin-bottom: 3px;
  background-color: var(--hover);
}
.badge {
  border-radius: 1rem;
}

.badge-Inconnue {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border: 1px solid var(--red-marianne-925-125);
}
.badge-Conventionnel {
  color: var(--green-tilleul-verveine-sun-418-moon-817);
  background-color: var(--green-tilleul-verveine-925-125);
  border: 1px solid var(--green-tilleul-verveine-850-200);
}
.badge-C1 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-975-75);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-C2 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-950-100);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-C3 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-925-125);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-AB {
  color: white;
  background-color: var(--green-bourgeon-sun-425-moon-759);
  border: 1px solid var(--green-bourgeon-sun-425-moon-759);
}
</style>
