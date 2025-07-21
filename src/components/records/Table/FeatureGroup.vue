<template>
  <div
    class="fr-grid-row fr-mb-2v fr-px-4v fr-py-4v groupe-parcelles"
    @click.stop="open = !open"
    @keydown.enter="open = !open"
  >
    <div class="fr-grid-row groupe-titre fr-mb-0">
      <p class="fr-sr-only">{{ groupErrors }} parcelles à amender</p>
      <span v-if="groupErrors" class="erreurs fr-grid-row fr-grid-row--middle fr-px-1v">
        <span
          class="fr-icon fr-icon--sm fr-icon-warning-line fr-py-0"
          :title="`${groupErrors} parcelles à amender`"
          aria-hidden="true"
        />
        {{ groupErrors }}
      </span>
      <h3 class="fr-text--lg fr-text--regular fr-mb-0 fr-grid-row fr-grid-row--middle">
        <span v-if="isGroupedByCulture" :class="getCultureIcon(featureGroup.key)" class="fr-mr-1v"></span>
        {{ featureGroup.label }}
      </h3>
    </div>
    <div class="fr-grid-row gap-10 actions-parcelles">
      <span class="">
        {{
          !isNaN(parseFloat(inHa(featureGroup.surface)))
            ? inHa(featureGroup.surface) + " ha"
            : inHa(featureGroup.surface)
        }}
      </span>
      <div class="fr-checkbox-group">
        <input type="checkbox" :id="'radio-' + featureGroup.key" :checked="allSelected" @click="toggleFeatureGroup" />
        <label
          class="fr-label"
          :for="'radio-' + featureGroup.key"
          :aria-label="
            allSelected
              ? `Désélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`
              : `Sélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`
          "
        />
      </div>
      <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="open" aria-role="button" />
    </div>
  </div>
  <div
    class="parcelle-carte fr-mb-2v fr-p-4v fr-mx-4v"
    :class="{
      'parcelle--is-new': feature.id === Number(route.query?.new),
      'background-selected': selectedIds.includes(feature.id),
    }"
    :id="'parcelle-' + feature.id"
    :hidden="!open"
    v-for="feature in featureGroup.features"
    :key="feature.id"
    @mouseover="hoveredId = feature.id"
    :aria-current="feature.id === hoveredId ? 'location' : null"
  >
    <div @click="pressZoom(feature.id)" class="parcelle-titre fr-mb-6v">
      <h4
        class="fr-text--lg fr-mb-0"
        :class="{
          'fr-icon fr-icon-checkbox-fill fr-icon fr-icon--lg fr-icon--left controlee': feature.properties.controlee,
        }"
      >
        {{ featureName(feature) }}
      </h4>
      <div class="parcelle-actions">
        <template v-if="isGroupedByCulture">
          <small v-if="feature.properties.cultures.length > 1">Multi-culture</small>
          <button
            v-else-if="
              (permissions.canChangeCulture && feature.properties.cultures.length === 0) || !feature.properties.cultures
            "
            class="red radius fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-edit-line menu-button"
            @click="openCulturesModal(feature.id)"
          >
            Saisir la culture
          </button>
        </template>
        <template v-else>
          <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
            Multi-cultures<span class="fr-sr-only"> : </span>
            <small v-for="(culture, i) in feature.properties.cultures" :key="i">
              <span v-if="i" class="fr-sr-only">, </span>{{ cultureLabel(culture) }}
            </small>
          </p>
          <p v-else class="fr-mb-0">{{ cultureLabel(feature.properties.cultures[0]) }}</p>
        </template>
        <p class="fr-mb-0">
          {{
            !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
              ? inHa(legalProjectionSurface(feature)) + "&nbsp;ha"
              : inHa(legalProjectionSurface(feature))
          }}
        </p>
        <div class="fr-checkbox-group">
          <input
            type="checkbox"
            :id="'radio-' + feature.id"
            :checked="selectedIds.includes(feature.id)"
            @click="
              toggleSingleSelected(feature.id);
              selectedIds.includes(feature.id) ? pressZoom(feature.id) : null;
            "
          />
          <label
            class="fr-label"
            :for="'radio-' + feature.id"
            :aria-label="
              selectedIds.includes(feature.id)
                ? `Désélectionner ${featureName(feature)}`
                : `Sélectionner ${featureName(feature)}`
            "
          />
        </div>
      </div>
    </div>
    <div @click="pressZoom(feature.id)" class="fr-grid-row fr-grid-row--middle parcelle-titre">
      <div @click="openNiveauConversionModal(feature.id)" :class="{ clickable: permissions.canChangeConversionLevel }">
        <ConversionLevel :feature="feature" with-date />
      </div>
      <div class="fr-grid-row fr-grid-row--middle gap-10">
        <p class="fr-sr-only"></p>
        <span
          v-if="feature.properties.commentaires || feature.properties.auditeur_notes"
          aria-hidden="true"
          class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire"
        >
          1
        </span>
        <p class="fr-mb-0 fr-text--sm text-grey">
          {{ getTimeAgo(feature) }}
        </p>
        <ActionDropdown with-icons>
          <li v-if="!readonly">
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-edit-line fr-text--sm"
              @click="toggleEditForm(feature.id)"
            >
              Modifier les informations de la parcelle
            </button>
          </li>
          <li v-else>
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-text--sm"
              @click="toggleViewForm(feature.id)"
            >
              <span class="ri-eye-line ri-xl fr-mr-2v" aria-hidden="true"></span>
              Voir les informations de la parcelle
            </button>
          </li>
          <li v-if="permissions.canChangeGeometry && isOnline && !readonly" class="more-actions">
            <router-link
              :to="`/exploitations/${operatorStore.operator.numeroBio}/${recordStore.record.record_id}/modifier/${feature.id}`"
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm"
            >
              Modifier la parcelle
            </router-link>
          </li>
          <li v-else>
            <button type="button" disabled class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm">
              Modifier la parcelle
            </button>
          </li>
          <li>
            <button
              type="button"
              @click.prevent="toggleDeleteForm(feature.id)"
              :disabled="!permissions.canDeleteFeature"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-text--sm"
            >
              Supprimer la parcelle
            </button>
          </li>
        </ActionDropdown>
      </div>
    </div>
  </div>
  <p :id="`operator-features-summary-${featureGroup.key}`" class="fr-sr-only">
    Liste de {{ featureGroup.features.length }} parcelles cultivées en {{ featureGroup.label.toLocaleLowerCase() }}. La
    première colonne contient le nom de la parcelle ; la seconde, son statut de certification et éventuelle date de
    début de conversion ; la troisième, sa surface en hectares ; la quatrième et dernière colonne, des boutons d'action.
  </p>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useOperatorStore } from "@/stores/operator.js";
import { useRecordStore } from "@/stores/record.js";
import { useFeaturesStore } from "@/stores/features.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";

import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";
import ActionDropdown from "@/components/widgets/ActionDropdown.vue";
import { useOnline } from "@vueuse/core";
import {
  cultureLabel,
  featureName,
  inHa,
  legalProjectionSurface,
  getTimeAgo,
  getCultureIcon,
} from "@/utils/features.js";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const featuresStore = useFeaturesStore();
const userStore = useUserStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();
const isOnline = useOnline();

const props = defineProps({
  featureGroup: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "edit:featureId",
  "edit-niveau-conversion:featureId",
  "edit-cultures:featureId",
  "view:featureId",
  "delete:featureId",
  "zoom:featureId",
]);

const { selectedIds, hoveredId } = storeToRefs(featuresStore);
const { toggleSingleSelected } = featuresStore;

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id));
const open = ref(
  featureIds.value.includes(String(route.query?.new)) || featureIds.value.some((id) => selectedIds.value.includes(id)),
);
const allSelected = computed(() => featureIds.value.every((id) => selectedIds.value.includes(id)));
const isGroupedByCulture = computed(() => props.featureGroup.pivot === "CULTURE");

const groupErrors = computed(() => {
  return featureIds.value.reduce((sum, id) => sum + featuresSets.byFeature(id, true).size, 0);
});

const readonly = computed(() => {
  return (
    permissions.isOc &&
    recordStore.record.oc_id != null &&
    recordStore.record.oc_id !== userStore.user?.organismeCertificateur?.id
  );
});

function toggleEditForm(featureId) {
  if (readonly.value) {
    return;
  }
  return emit("edit:featureId", featureId);
}

function toggleViewForm(featureId) {
  if (!readonly.value) {
    return;
  }
  return emit("view:featureId", featureId);
}

function toggleDeleteForm(featureId) {
  if (readonly.value) {
    return;
  }
  return emit("delete:featureId", featureId);
}

function pressZoom(featureId) {
  return emit("zoom:featureId", featureId);
}

function toggleFeatureGroup() {
  // we uncheck them
  if (allSelected.value) {
    featuresStore.unselect(...featureIds.value);
  } else {
    featuresStore.select(...featureIds.value);
  }
}

function openNiveauConversionModal(id) {
  if (permissions.canChangeConversionLevel) {
    emit("edit-niveau-conversion:featureId", id);
  }
}

function openCulturesModal(id) {
  if (permissions.canChangeConversionLevel) {
    emit("edit-cultures:featureId", id);
  }
}

watch(selectedIds, (selectedIds, prevSelectedIds) => {
  const newItems = featureIds.value.filter((id) => {
    return selectedIds.includes(id) && !prevSelectedIds.includes(id);
  });

  if (newItems.length === 1 && newItems.length !== featureIds.value.length) {
    open.value = true;
  }
});
</script>

<style scoped>
.erreurs {
  align-self: center;
  color: var(--text-default-error);
  border: 1px solid var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border-radius: 4px;
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

.groupe-parcelles {
  background-color: var(--blue-france-925-125);
  gap: 12px;
  justify-content: space-between;

  .groupe-titre {
    gap: 7px;
  }
  .groupe-titre > h3 {
    height: 40px;
  }
  .actions-parcelles {
    align-content: center;
  }
}

.gap-10 {
  gap: 10px;
}

.parcelle-carte {
  border: 1px solid #ececfe;
  &.parcelle--is-new {
    background-color: var(--green-tilleul-verveine-975-75);
  }
  &.background-selected,
  &:hover {
    background-color: var(--background-alt-blue-france);
  }
  .parcelle-titre {
    display: flex;
    justify-content: space-between;
    .parcelle-actions {
      display: flex;
      gap: 25px;
    }
  }
  :deep(.show-actions) {
    --hover-tint: var(--background-alt-blue-france-hover);
    --active-tint: var(--background-alt-blue-france-active);
  }
}

.text-grey {
  color: var(--grey-625-425);
}

.badge-commentaire {
  background-color: var(--grey-950-150);
  padding: 4px 10px;
  border-radius: 16px;
}

.clickable {
  cursor: pointer;
}

.red {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border: 1px solid var(--text-default-error);
  box-shadow: none;
}

.radius {
  border-radius: 16px;
}

.red:hover {
  background-color: var(--red-marianne-925-125-active);
}

.controlee:before {
  margin-right: 5px;
  color: var(--success-425-625-active);
}
</style>
