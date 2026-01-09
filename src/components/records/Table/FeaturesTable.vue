<template>
  <h2 class="fr-sr-only" id="parcellaire">Parcellaire</h2>
  <div class="fr-grid-row fr-grid-row--middle fr-mt-2v fr-mb-5v fr-mr-2w" ref="contentTopFeatures">
    <div class="fr-search-bar fr-pl-1v fr-col-12 fr-col-md-6" id="search" role="search">
      <p class="fr-sr-only" id="search-desc">Recherche soumis automatiquement lors de la saisie</p>
      <label class="fr-label" for="search-784-input">Rechercher une parcelle </label>
      <input
        class="fr-input"
        placeholder="Rechercher une parcelle"
        type="search"
        id="search-784-input"
        name="search-784-input"
        v-model="filterInput"
        aria-describedby="search-desc"
      />
      <button class="fr-btn" title="Rechercher">Rechercher une parcelle</button>
    </div>
    <div class="seamless-select fr-col-12 fr-col-md-6 fr-pl-1v fr-grid-row">
      <label for="plots-group-by">Regrouper par </label>
      <b class="font-blue fr-mr-2w text-truncate">{{ groupingChoiceLabel }}</b>
      <select id="plots-group-by" v-model="userGroupingChoice">
        <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key">&nbsp;&nbsp;{{ label }}</option>
      </select>
    </div>
  </div>
  <div class="fr-grid-row fr-grid-row--middle liste-filtre fr-mb-3v">
    <b>Filtrer</b>
    <button
      :key="id"
      v-for="{ active, id, count, label, required } in tags.filter((t) => t.required)"
      class="fr-tag fr-tag--sm red"
      :class="{
        'fr-icon-filter-line fr-tag--icon-left': required,
      }"
      :aria-pressed="active"
      :aria-label="`${label}, ${active ? 'filtre activé' : 'filtre désactivé'}`"
      @click="handleFilterClick(id)"
      v-tooltip="{
        text: `${label}, ${active ? 'filtre activé' : 'filtre désactivé'}`,
        position: 'top',
      }"
    >
      {{ label }} ({{ count }})
    </button>
  </div>

  <div
    v-if="selectedFeatureIds.length > 0"
    role="status"
    aria-live="polite"
    class="fr-grid-row selection-multiple fr-mt-4v fr-mb-2v fr-py-2v"
  >
    <div class="fr-grid-row gap-10">
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-close-line"
        aria-label="Désélectionner toutes les parcelles"
        @click="unselectAll"
        v-tooltip="{ text: 'Déselectionner les parcelles sélectionnées ', position: 'top' }"
      ></button>
      <p class="fr-mb-0 fr-grid-row fr-grid-row--middle">
        {{ selectedFeatureIds.length }} parcelle{{ selectedFeatureIds.length > 1 ? "s" : "" }} sélectionnée{{
          selectedFeatureIds.length > 1 ? "s" : ""
        }}
      </p>
      <p class="fr-mb-0 fr-grid-row fr-grid-row--middle">
        <span
          >{{
            !isNaN(parseFloat(inHa(legalProjectionSurface(selectedFeatures))))
              ? inHa(legalProjectionSurface(selectedFeatures)) + " ha"
              : ""
          }}
        </span>
      </p>
    </div>
    <div id="mass-edit">
      <MassActionsSelector
        v-if="massActions.length"
        :actions="massActions"
        label="Modifier"
        @openModal="emit('edit:featureId', null)"
        @submit="handleFeatureCollectionSubmit"
      />
      <button
        v-if="massActions.length"
        type="button"
        @click.prevent="toggleFeaturesDelete()"
        :disabled="!permissions.canDeleteFeature"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-btn--sm"
        v-tooltip="{ text: 'Supprimer les parcelles sélectionnées', position: 'top' }"
      >
        Supprimer la parcelle
      </button>
    </div>
  </div>
  <div class="flex-space-between">
    <div class="fr-grid-row total-parcelles fr-mr-5w fr-mt-2w">
      <div class="fr-checkbox-group fr-checkbox-group--sm" v-if="hasFeatures">
        <input
          ref="groupCheckbox"
          type="checkbox"
          id="radio-select-all"
          :checked="allSelected"
          @click="toggleAllSelected"
        />
        <label
          class="fr-label"
          for="radio-select-all"
          aria-label="Sélectionner toutes les parcelles"
          v-tooltip="{ text: 'Selectionner toutes les parcelles ', position: 'top' }"
        />
      </div>
      <p class="fr-hint-text fr-text--md">
        {{ features.length }} parcelles
        {{
          !isNaN(parseFloat(inHa(legalProjectionSurface(features))))
            ? "(" + inHa(legalProjectionSurface(features)) + " ha)"
            : ""
        }}
      </p>
    </div>
    <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="openAll">
      {{ hasExpandedGroups ? "Tout replier" : "Tout déplier" }}
    </button>
  </div>

  <p v-if="!hasFeatures">Votre parcellaire est vide.</p>
  <div v-if="!isTab">
    <FeatureGroup
      v-for="featureGroup in featureGroups"
      id="featureGroup1"
      :featureGroup="featureGroup"
      :key="featureGroup.key"
      @toggle="(isExpanded) => handleGroupToggle(featureGroup.key, isExpanded)"
      @edit:featureId="(featuredId) => emit('edit:featureId', featuredId)"
      @view:featureId="(featuredId) => emit('view:featureId', featuredId)"
      @delete:featureId="(featureId) => (maybeDeletedFeatureId = featureId)"
      @zoom:featureId="(featureId) => emit('zoom:featureId', featureId)"
      @editNiveauConversion:featureId="(featuredId) => emit('edit-niveau-conversion:featureId', featuredId)"
      @editCultures:featureId="(featuredId) => emit('edit-cultures:featureId', featuredId)"
    />
  </div>
  <div v-else>
    <FeatureGroupLigne
      v-for="featureGroup in featureGroups"
      id="featureGroup2"
      :featureGroup="featureGroup"
      :key="featureGroup.key + '-modal'"
      @toggle="(isExpanded) => handleGroupToggle(featureGroup.key, isExpanded)"
      @edit:featureId="(featuredId) => emit('edit:featureId', featuredId)"
      @view:featureId="(featuredId) => emit('view:featureId', featuredId)"
      @delete:featureId="(featureId) => (maybeDeletedFeatureId = featureId)"
      @zoom:featureId="(featureId) => emit('zoom:featureId', featureId)"
      @editNiveauConversion:featureId="(featuredId) => emit('edit-niveau-conversion:featureId', featuredId)"
      @editCultures:featureId="(featuredId) => emit('edit-cultures:featureId', featuredId)"
    />
  </div>

  <p id="operator-features-summary-global" class="fr-sr-only" v-if="hasFeatures" role="status" aria-live="polite">
    Liste de {{ features.length }} parcelles regroupées par {{ groupingChoiceLabel }}. Actuellement,
    {{ selectedFeatureIds.length }} parcelles sont sélectionnées.
  </p>
  <p class="fr-sr-only" v-else role="status" aria-live="polite">Ce parcellaire ne contient aucune parcelle.</p>

  <Teleport to="body">
    <DeleteFeatureModal
      v-if="maybeDeletedFeatureId"
      @close="maybeDeletedFeatureId = false"
      :feature-id="maybeDeletedFeatureId"
      @submit="handleSingleFeatureDeletion"
    />
    <DeleteModal
      v-if="deleteModalMultiple"
      @submit="(e) => handleMultipleDelete(e)"
      @close="deleteModalMultiple = false"
    />
  </Teleport>

  <p class="fr-mt-4v">
    <a
      href=""
      @click.prevent.stop="scrollToTop()"
      class="fr-icon--sm fr-icon-arrow-up-fill"
      aria-label="Retour en haut de la page"
    >
      retour en haut de la page
    </a>
  </p>
</template>
<script setup>
import { computed, ref, watch, inject, provide } from "vue";
import { storeToRefs } from "pinia";

import { useFeaturesStore } from "@/stores/features.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";

import MassActionsSelector from "@/components/records/Table/MassActionsSelector.vue";
import DeleteFeatureModal from "@/components/forms/DeleteFeatureForm.vue";
import DeleteModal from "@/components/forms/DeleteForm.vue";
import FeatureGroup from "@/components/records/Table/FeatureGroup.vue";
import FeatureGroupLigne from "@/components/records/Table/FeatureGroupLigne.vue";

import toast from "@/utils/toast.js";
import { statsPush } from "@/stats.js";
import { useOnline } from "@vueuse/core";
import { featureName, getFeatureGroups, groupingChoices, inHa, legalProjectionSurface } from "@/utils/features.js";

const filterInput = ref(null);

const props = defineProps({
  editForm: {
    type: Object,
  },
  viewForm: {
    type: Object,
  },
  massActions: {
    type: Array,
    default: () => [],
  },
  groupKey: {
    type: String,
    default: "CULTURE",
  },
  isTab: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "edit:featureId",
  "view:featureId",
  "zoom:featureId",
  "edit-niveau-conversion:featureId",
  "edit-cultures:featureId",
  "change-tri",
]);

const loading = inject("loading", ref(null));
const isOnline = useOnline();

const featuresStore = useFeaturesStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();

const contentTopFeatures = ref(null);

const openAllState = ref({
  shouldOpen: null,
  timestamp: 0,
});
provide("openAll", openAllState);
const expandedGroupKeys = ref(new Set());

const { hits: features, tags } = storeToRefs(featuresSets);
const { hasFeatures } = storeToRefs(featuresStore);
const { selectedIds: selectedFeatureIds, allSelected, selectedFeatures } = storeToRefs(featuresStore);
const { toggleAllSelected, unselectAll } = featuresStore;

const editedFeatureId = ref(null);
const maybeDeletedFeatureId = ref(null);
const deleteModalMultiple = ref(false);

const userGroupingChoice = ref(props.groupKey);
const featureGroups = computed(() =>
  getFeatureGroups({ features: features.value }, userGroupingChoice.value, filterInput.value),
);
const groupingChoiceLabel = computed(() => groupingChoices[userGroupingChoice.value].label);

async function handleSingleFeatureDeletion({ id, reason }) {
  statsPush(["trackEvent", "Parcelles", "Suppression individuelle (sauvegarde)"]);

  maybeDeletedFeatureId.value = null;
  editedFeatureId.value = null;

  const deletedFeatureName = featureName(featuresStore.getFeatureById(id));
  await featuresStore.deleteSingleFeature({ id, reason });
  if (isOnline.value) {
    loading.value = true;
  } else toast.success(`Parcelle « ${deletedFeatureName} » supprimée.`);
}

async function handleFeatureCollectionSubmit({ ids, patch }) {
  statsPush(["trackEvent", "Parcelles", "Modification multiple (sauvegarde)"]);
  editedFeatureId.value = null;
  const featureCollection = {
    type: "FeatureCollection",
    features: ids.map((id) => ({
      id,
      properties: { ...patch },
    })),
  };
  await featuresStore.updateFeatureCollectionProperties(featureCollection);
  if (isOnline.value) {
    loading.value = true;
  } else toast.success("Parcelles modifiées.");
}

function handleFilterClick(id) {
  featuresSets.toggle(id);

  if (featuresSets.isToggled(id)) {
    statsPush(["trackEvent", "Filtre parcelles", id]);
  }
}

async function toggleFeaturesDelete() {
  deleteModalMultiple.value = !deleteModalMultiple.value;
}
async function handleMultipleDelete(reason) {
  editedFeatureId.value = null;

  for (const featureId of featuresStore.selectedIds) {
    await featuresStore.deleteSingleFeature({ id: featureId, reason });
  }
  if (isOnline.value) {
    loading.value = true;
  } else toast.success(`Parcelle « ${deletedFeatureName} » supprimée.`);

  featuresStore.unselectAll([]);
  toggleFeaturesDelete();
  return;
}

function scrollToTop() {
  if (document.getElementById("headerRecord")) {
    const element = document.getElementById("headerRecord");
    element.scrollIntoView({ block: "start" });
  }
}

const hasExpandedGroups = computed(() => {
  return expandedGroupKeys.value.size > 0;
});

function openAll() {
  if (hasExpandedGroups.value) {
    openAllState.value = {
      shouldOpen: false,
      timestamp: Date.now(),
    };
    expandedGroupKeys.value.clear();
  } else {
    openAllState.value = {
      shouldOpen: true,
      timestamp: Date.now(),
    };
    featureGroups.value.forEach((group) => {
      expandedGroupKeys.value.add(group.key);
    });
  }
}
function handleGroupToggle(groupKey, isExpanded) {
  if (isExpanded) {
    expandedGroupKeys.value.add(groupKey);
  } else {
    expandedGroupKeys.value.delete(groupKey);
  }
}

watch(featureGroups, () => {
  const validKeys = new Set(featureGroups.value.map((g) => g.key));
  expandedGroupKeys.value = new Set([...expandedGroupKeys.value].filter((key) => validKeys.has(key)));
});

const groupCheckbox = ref(null);

watch(selectedFeatureIds, () => {
  groupCheckbox.value.indeterminate = !allSelected.value && selectedFeatureIds.value.length > 0;
});

watch(userGroupingChoice, (newValue) => {
  if (newValue) {
    emit("changeTri");
  }
});
</script>

<style>
.single-checkbox input[type="checkbox"] + label::before {
  left: auto !important;
  top: auto !important;
  margin: 0 !important;
}

.single-checkbox input[type="checkbox"] + label {
  margin: 0 !important;
}
</style>

<style scoped>
.seamless-select {
  gap: 5px;
  position: relative;
  padding-right: 1rem;
  font-weight: normal;
  font-size: 14px;
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Direction=Bas'%3E%3Cpath id='Ic&%23195;&%23180;ne' fill-rule='evenodd' clip-rule='evenodd' d='M12 13.172L16.95 8.222L18.364 9.636L12 16L5.63599 9.636L7.04999 8.222L12 13.172Z' fill='%23000091'/%3E%3C/g%3E%3C/svg%3E%0A");
  background-position: right bottom;
  background-repeat: no-repeat;
  justify-content: flex-end;

  & label {
    display: inline;
  }

  /* super hacky way to hide a select behind
   our custom div and still be able to interact with it
   (there is no way to open select fields programmatically) */
  & select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

button.fr-tag[aria-pressed="true"]:not(:disabled),
input[type="button"].fr-tag[aria-pressed="true"]:not(:disabled) {
  background-color: transparent;
  background-image: radial-gradient(
    circle at 100% 0.25rem,
    transparent 0.578125rem,
    var(--red-marianne-925-125-active) 0.625rem
  );
  color: var(--warning-425-625);
}

button.fr-tag[aria-pressed="true"]:not(:disabled):hover,
input[type="button"].fr-tag[aria-pressed="true"]:not(:disabled):hover {
  background-image: radial-gradient(
    circle at 100% 0.25rem,
    transparent 0.578125rem,
    var(--red-marianne-925-125-active) 0.625rem
  );
}

button.fr-tag[aria-pressed="true"]::after,
input[type="button"].fr-tag[aria-pressed="true"]::after {
  color: var(--warning-425-625);
}

.red {
  color: var(--warning-425-625);
  background-color: var(--warning-950-100);
}

.red:hover {
  background-color: var(--red-marianne-925-125-hover);
}

.red.fr-tag--dismiss {
  border: 1px solid var(--text-default-error);
}

.font-blue {
  color: #000091;
}

.font-little {
  font-size: 16px;
  margin-left: 10%;
}

.labels-group-by {
  color: black;
}

.liste-filtre {
  gap: 20px;
}

.selection-multiple {
  justify-content: space-between;
  background-color: #fafafe;
  color: #666666;
}

.gap-10 {
  gap: 10px;
}

.total-parcelles {
  gap: 10px;
  padding: 0 10px 0 15px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
  vertical-align: bottom;
}
.fr-checkbox-group input[type="checkbox"]:indeterminate + label::before {
  background-color: var(--background-active-blue-france);
  border-color: var(--background-active-blue-france);

  background-image: linear-gradient(to right, transparent 20%, white 20%, white 80%, transparent 80%);

  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 2px;
}

.flex-space-between {
  display: flex;
  justify-content: space-between;
}
</style>
