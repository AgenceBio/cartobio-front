<template>
  <div>
    <div
      class="fr-grid-row fr-px-4v fr-py-4v groupe-parcelles"
      tabindex="0"
      aria-expanded="open"
      aria-controls="group-content-{{ featureGroup.key }}"
      :class="{ 'groupe-titre-on': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <div class="fr-grid-row groupe-titre fr-mb-0">
        <div class="fr-text fr-text--regular fr-mb-0 fr-grid-row fr-grid-row--middle">
          <span v-if="isGroupedByCulture" :class="getCultureIcon(featureGroup.key)" class="fr-mr-1v"></span>
          <p class="fr-sr-only">{{ groupErrors }} parcelles à amender</p>
          <span v-if="groupErrors" class="erreurs fr-grid-row fr-grid-row--middle fr-px-1v fr-mx-2v fr-text--sm">
            <span
              class="fr-icon fr-icon--sm fr-icon-warning-line fr-py-0 icon-error"
              :title="`${groupErrors} parcelles à amender`"
              aria-hidden="true"
            />
            {{ groupErrors }}
          </span>
          <span class="label-group">{{ featureGroup.label }}</span>
        </div>
      </div>
      <div class="fr-grid-row gap-10 actions-parcelles">
        <span>
          {{
            !isNaN(parseFloat(inHa(featureGroup.surface)))
              ? inHa(featureGroup.surface) + " ha"
              : inHa(featureGroup.surface)
          }}
        </span>
        <div class="fr-checkbox-group fr-checkbox-group--sm">
          <input type="checkbox" :id="'radio-' + featureGroup.key" :checked="allSelected" @click="toggleFeatureGroup" />
          <label
            class="fr-label"
            :for="'radio-' + featureGroup.key"
            :aria-label="
              allSelected
                ? `Désélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`
                : `Sélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`
            "
            v-tooltip="{
              text: allSelected
                ? `Désélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`
                : `Sélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`,
              position: 'bottom',
            }"
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
        'fr-mt-2v': index === 0,
      }"
      :id="'parcelle-' + feature.id"
      :hidden="!open"
      v-for="(feature, index) in featureGroup.features"
      :key="feature.id"
      @mouseover="hoveredId = feature.id"
      :aria-current="feature.id === hoveredId ? 'location' : null"
      @click="(event) => clickOn(feature.id, event)"
    >
      <div class="parcelle-titre fr-mb-1v">
        <div v-if="isGroupedByCulture">
          <h4
            class="fr-text--lg fr-mb-0"
            :class="{
              'fr-icon fr-icon-checkbox-fill fr-icon fr-icon--md fr-icon--left controlee': feature.properties.controlee,
            }"
          >
            {{ featureName(feature, { explicitName: false }) }}
          </h4>
          <p
            class="fr-hint-text"
            v-if="featureName(feature, { nameOnly: true }) && feature.properties.NUMERO_I != null"
          >
            {{ featureName(feature, { nameOnly: true }) }}
          </p>
        </div>
        <div v-else>
          <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
            Multi-cultures <span class="fr-sr-only"> : </span>
            <small v-for="(culture, i) in feature.properties.cultures" :key="i">
              <span v-if="i" class="fr-sr-only">, </span> {{ cultureLabel(culture) }}
            </small>
          </p>
          <h4 v-else class="fr-text--lg fr-mb-0">{{ cultureLabel(feature.properties.cultures[0]) }}</h4>

          <p class="fr-hint-text">{{ featureName(feature, { hint: true }) }}</p>
        </div>
        <div class="parcelle-actions">
          <template v-if="isGroupedByCulture">
            <small v-if="feature.properties.cultures.length > 1">Multiculture</small>
            <button
              v-else-if="
                permissions.canChangeCulture &&
                feature.properties.cultures.length === 1 &&
                (feature.properties.cultures[0].CPF === undefined ||
                  feature.properties.cultures[0].CPF === '' ||
                  !feature.properties.cultures) &&
                !(
                  feature.properties.conversion_niveau === LEVEL_MAYBE_AB ||
                  feature.properties.conversion_niveau === LEVEL_UNKNOWN ||
                  feature.properties.conversion_niveau === '' ||
                  feature.properties.conversion_niveau === null
                )
              "
              class="red radius fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-pencil-line"
              @click.stop.prevent="openCulturesModal(feature.id)"
              v-tooltip="tooltips.modifCul"
            >
              Culture
            </button>
          </template>
          <p class="fr-mb-0">
            {{
              !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
                ? inHa(legalProjectionSurface(feature)) + "&nbsp;ha"
                : inHa(legalProjectionSurface(feature))
            }}
          </p>
          <div class="fr-checkbox-group fr-checkbox-group--sm">
            <input
              type="checkbox"
              :id="'radio-' + feature.id"
              :checked="selectedIds.includes(feature.id)"
              @click="handleClickChebox(feature.id)"
            />
            <label
              class="fr-label"
              :for="'radio-' + feature.id"
              :aria-label="
                selectedIds.includes(feature.id)
                  ? `Désélectionner ${featureName(feature)}`
                  : `Sélectionner ${featureName(feature)}`
              "
              v-tooltip="selectedIds.includes(feature.id) ? tooltips.unselectP : tooltips.selectP"
            />
          </div>
        </div>
      </div>
      <div class="fr-grid-row fr-grid-row--middle parcelle-titre">
        <div
          v-if="
            (feature.properties.conversion_niveau === LEVEL_MAYBE_AB ||
              feature.properties.conversion_niveau === LEVEL_UNKNOWN ||
              feature.properties.conversion_niveau === '' ||
              feature.properties.conversion_niveau === null) &&
            (feature.properties.cultures[0].CPF === undefined || feature.properties.cultures[0].CPF === '') &&
            feature.properties.cultures.length === 1
          "
        >
          <button
            class="red radius fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-pencil-line"
            @click.stop.prevent="toggleEditForm(feature.id)"
            v-tooltip="tooltips.complete"
          >
            Compléter
          </button>
        </div>
        <div
          @click.stop.prevent="openNiveauConversionModal(feature.id)"
          :class="{ clickable: permissions.canChangeConversionLevel }"
          v-else
          v-tooltip="tooltips.modifConv"
        >
          <ConversionLevel noIcon with-date :feature="feature" labelSelector />
        </div>
        <div class="fr-grid-row fr-grid-row--middle gap-10">
          <p class="fr-sr-only"></p>
          <span v-if="isRota(feature)" :class="isRota(feature)"><i class="ri-exchange-funds-line"></i>ROTATION</span>
          <span
            v-if="feature.properties.commentaires || feature.properties.auditeur_notes"
            aria-hidden="true"
            class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-fill fr-mb-0 badge-commentaire"
          >
            {{ [feature.properties.commentaire, feature.properties.auditeur_notes].filter((e) => e != null).length }}
          </span>
          <p class="fr-mb-0 fr-text--sm text-grey">
            <span v-if="getTimeAgo(feature)" aria-hidden="true" class="fr-icon-refresh-line fr-icon--sm"></span>
            {{ getTimeAgo(feature) }}
          </p>
          <button
            type="button"
            @click.prevent="toggleDeleteForm(feature.id)"
            :disabled="!permissions.canDeleteFeature"
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-btn--sm"
            v-tooltip="tooltips.deleteParcelle"
          >
            Supprimer la parcelle
          </button>
        </div>
      </div>
    </div>
    <p :id="`operator-features-summary-${featureGroup.key}`" class="fr-sr-only">
      Liste de {{ featureGroup.features.length }} parcelles cultivées en {{ featureGroup.label.toLocaleLowerCase() }}.
      La première colonne contient le nom de la parcelle ; la seconde, son statut de certification et éventuelle date de
      début de conversion ; la troisième, sa surface en hectares ; la quatrième et dernière colonne, des boutons
      d'action.
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject, nextTick, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useRecordStore } from "@/stores/record.js";
import { useFeaturesStore } from "@/stores/features.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";
import { LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from "@/referentiels/ab.js";

import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";
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
const recordStore = useRecordStore();
const featuresStore = useFeaturesStore();
const userStore = useUserStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();

const props = defineProps({
  featureGroup: {
    type: Object,
    required: true,
  },
});
const nullValue = ref(null);
const scrool = inject("scroolToFeatureId", nullValue);

const emit = defineEmits([
  "edit:featureId",
  "edit-niveau-conversion:featureId",
  "edit-cultures:featureId",
  "view:featureId",
  "delete:featureId",
  "zoom:featureId",
]);

const tooltips = {
  complete: { text: "Compléter la culture et le niveau de conversion", position: "top" },
  modifConv: { text: "Modifier le niveau de conversion", position: "top" },
  deleteParcelle: { text: "Supprimer la parcelle", position: "top" },
  selectP: { text: "Sélectionner la parcelle", position: "top" },
  unselectP: { text: "Désélectionner la parcelle", position: "top" },
  modifCul: { text: "Modifier la culture", position: "top" },
};
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
  pressZoom(featureId);
  return emit("edit:featureId", featureId);
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
  if (allSelected.value) {
    featuresStore.unselect(...featureIds.value);
  } else {
    featuresStore.select(...featureIds.value);
  }
}

function handleClickChebox(featureIds) {
  toggleSingleSelected(featureIds);
  selectedIds.value.includes(featureIds) ? pressZoom(featureIds) : null;
  if (selectedIds.value.length > 1) {
    emit("edit:featureId", null);
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

function isRota(feature) {
  const index = 0;
  if (!feature.properties.historique) return 0;
  const currentCultures = feature.properties.historique[index];
  if (!currentCultures || currentCultures.cultures.length !== 1) return 0;

  let count = 1;

  for (let i = index - 1; i >= 0; i--) {
    const voisin = feature.properties.historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) => currentCultures.cultures.some((a) => c.CPF === a.CPF));
    if (match) {
      count++;
    } else {
      break;
    }
  }
  for (let i = index + 1; i < feature.properties.historique.length; i++) {
    const voisin = feature.properties.historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) => currentCultures.cultures.some((a) => c.CPF === a.CPF));
    if (match) {
      count++;
    } else {
      break;
    }
  }

  return count >= 3 ? "rouge" : count > 1 ? "jaune" : null;
}

watch(selectedIds, (selectedIds, prevSelectedIds) => {
  const newItems = featureIds.value.filter((id) => {
    return selectedIds.includes(id) && !prevSelectedIds.includes(id);
  });

  if (newItems.length === 1 && newItems.length !== featureIds.value.length) {
    open.value = true;
  }
});

watch(
  () => scrool,
  async (newValue) => {
    if (newValue.value != null && props.featureGroup.features.some((e) => e.id === newValue.value)) {
      open.value = true;
      await nextTick();
      if (document.getElementById("parcelle-" + newValue.value)) {
        const element = document.getElementById("parcelle-" + newValue.value);
        element.scrollIntoView({ block: "center" });
        scrool.value = null;
      }
    }
  },
  { deep: true },
);

function clickOn(id, event) {
  if (event.ctrlKey) {
    toggleSingleSelected(id);
  } else {
    toggleEditForm(id);
  }
}

onMounted(async () => {
  if (scrool.value != null && props.featureGroup.features.some((e) => e.id === scrool.value)) {
    open.value = true;
    await nextTick();
    if (document.getElementById("parcelle-" + scrool.value)) {
      const element = document.getElementById("parcelle-" + scrool.value);
      const y = element.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;

      window.scrollTo({ top: y, behavior: "smooth" });
      scrool.value = null;
    }
  }
});
</script>

<style scoped>
.erreurs {
  align-self: center;
  color: var(--warning-425-625);
  border: 1px solid #ffbdb2;
  background-color: var(--warning-950-100);
  border-radius: 4px;
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

.groupe-parcelles {
  gap: 12px;
  justify-content: space-between;
  border-top: 1px solid var(--artwork-decorative-blue-france);

  .groupe-titre {
    gap: 7px;
  }

  .actions-parcelles {
    align-content: center;
  }
}

.groupe-titre-on {
  background-color: var(--blue-france-925-125);
}

.groupe-parcelles:hover {
  background-color: var(--blue-france-925-125-hover);
  cursor: pointer;
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
  background-color: var(--blue-france-950-100);
  color: var(--artwork-minor-blue-france);
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-commentaire::before {
  margin-right: 5px;
}

.icon-error::before {
  margin-right: 5px;
}

.clickable {
  cursor: pointer;
}

.radius {
  border-radius: 16px;
}

.red {
  color: var(--warning-425-625);
  background-color: var(--warning-950-100);
  font-size: 12px;
  font-weight: 400;
}

.red:hover {
  background-color: var(--red-marianne-925-125-hover);
}

.controlee:before {
  margin-right: 5px;
  color: var(--success-425-625-active);
}

.rouge {
  background: rgba(255, 233, 230, 1);
  border-radius: 4px;
  color: rgba(179, 64, 0, 1);
  font-size: 12px;
  font-weight: bold;
  padding: 0px 6px;
}

.jaune {
  color: rgba(113, 96, 67, 1);
  background: rgba(254, 236, 194, 1);
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  padding: 0px 6px;
}

.label-group {
  max-width: 30ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.complete-button {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  box-shadow: none;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  font-weight: 400;
  border-radius: 16px;
  padding-top: 2px;
  padding-right: 8px;
  padding-bottom: 2px;
  padding-left: 8px;
}

.complete-button:hover {
  background-color: var(--red-marianne-925-125);
}

.fr-hint-text {
  margin-bottom: 5px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
  vertical-align: bottom;
}

.groupe-parcelles {
  flex-wrap: nowrap !important;
}

.groupe-titre {
  flex: 1;
  min-width: 0;
  flex-wrap: nowrap !important;
}

.groupe-titre .fr-text {
  flex: 1;
  min-width: 0;
  flex-wrap: nowrap !important;
}

.groupe-titre .fr-text .erreurs {
  flex-shrink: 0;
}

.label-group {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

.actions-parcelles {
  flex-shrink: 0;
  flex-wrap: nowrap !important;
}
</style>
