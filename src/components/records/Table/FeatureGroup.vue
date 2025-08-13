<template>
  <div>
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
          />
        </div>
        <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="open" aria-role="button" />
      </div>
    </div>
    <div v-if="!isTab">
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
        @click="(event) => clickOn(feature.id, event)"
      >
        <div class="parcelle-titre fr-mb-1v">
          <div v-if="isGroupedByCulture">
            <h4
              class="fr-text--lg fr-mb-0"
              :class="{
                'fr-icon fr-icon-checkbox-fill fr-icon fr-icon--lg fr-icon--left controlee':
                  feature.properties.controlee,
              }"
            >
              {{ featureName(feature, { explicitName: false }) }}
            </h4>
            <p class="fr-hint-text" v-if="featureName(feature, { nameOnly: true })">
              {{ featureName(feature, { nameOnly: true }) }}
            </p>
          </div>
          <div v-else>
            <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
              Multi-cultures<span class="fr-sr-only"> : </span>
              <small v-for="(culture, i) in feature.properties.cultures" :key="i">
                <span v-if="i" class="fr-sr-only">, </span>{{ cultureLabel(culture) }}
              </small>
            </p>
            <h4 v-else class="fr-text--lg fr-mb-0">{{ cultureLabel(feature.properties.cultures[0]) }}</h4>

            <p class="fr-hint-text">{{ featureName(feature, { hint: true }) }}</p>
          </div>
          <div class="parcelle-actions">
            <template v-if="isGroupedByCulture">
              <small v-if="feature.properties.cultures.length > 1">Multi-culture</small>
              <button
                v-else-if="
                  (permissions.canChangeCulture && feature.properties.cultures.length === 0) ||
                  !feature.properties.cultures
                "
                class="red radius fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-edit-line menu-button"
                @click="openCulturesModal(feature.id)"
              >
                Saisir la culture
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
          <div
            @click="openNiveauConversionModal(feature.id)"
            :class="{ clickable: permissions.canChangeConversionLevel }"
          >
            <ConversionLevel :feature="feature" with-date />
          </div>
          <div class="fr-grid-row fr-grid-row--middle gap-10">
            <p class="fr-sr-only"></p>
            <span v-if="isRota(feature)" :class="isRota(feature)"><i class="ri-exchange-funds-line"></i>ROTATION</span>
            <span
              v-if="feature.properties.commentaires || feature.properties.auditeur_notes"
              aria-hidden="true"
              class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire"
            >
              {{ [feature.properties.commentaire, feature.properties.auditeur_notes].filter((e) => e != null).length }}
            </span>
            <p class="fr-mb-0 fr-text--sm text-grey">
              {{ getTimeAgo(feature) }}
            </p>
            <button
              type="button"
              @click.prevent="toggleDeleteForm(feature.id)"
              :disabled="!permissions.canDeleteFeature"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-text--sm"
            >
              Supprimer la parcelle
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="min-width: 100%">
      <table style="min-width: 100%">
        <tr
          class="fr-mb-2v fr-p-4v fr-mx-4v"
          :id="'parcelle-' + feature.id"
          :hidden="!open"
          v-for="feature in featureGroup.features"
          :key="feature.id"
          @click="(event) => clickOn(feature.id, event)"
          style="width: 100%"
        >
          <td style="width: 20%">
            <div v-if="isGroupedByCulture">
              <h4
                class="fr-text--lg fr-mb-0"
                :class="{
                  'fr-icon fr-icon-checkbox-fill fr-icon fr-icon--lg fr-icon--left controlee':
                    feature.properties.controlee,
                }"
              >
                {{ featureName(feature, { explicitName: false }) }}
              </h4>
              <p class="fr-hint-text" v-if="featureName(feature, { nameOnly: true })">
                {{ featureName(feature, { nameOnly: true }) }}
              </p>
            </div>
            <div v-else>
              <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
                Multi-cultures<span class="fr-sr-only"> : </span>
                <small v-for="(culture, i) in feature.properties.cultures" :key="i">
                  <span v-if="i" class="fr-sr-only">, </span>{{ cultureLabel(culture) }}
                </small>
              </p>
              <h4 v-else class="fr-text--lg fr-mb-0">{{ cultureLabel(feature.properties.cultures[0]) }}</h4>

              <p class="fr-hint-text">{{ featureName(feature, { hint: true }) }}</p>
            </div>
          </td>
          <td style="width: 10%">{{ feature.properties.cultures[0].variete }}</td>
          <td style="width: 20%">
            <template v-if="isGroupedByCulture">
              <small v-if="feature.properties.cultures.length > 1">Multi-culture</small>
              <button
                v-else-if="
                  (permissions.canChangeCulture && feature.properties.cultures.length === 0) ||
                  !feature.properties.cultures
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
          </td>
          <td style="width: 10%">
            <p class="fr-mb-0">
              {{
                !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
                  ? inHa(legalProjectionSurface(feature)) + "&nbsp;ha"
                  : inHa(legalProjectionSurface(feature))
              }}
            </p>
          </td>
          <td style="width: 20%">
            <div
              style="width: fit-content"
              @click="openNiveauConversionModal(feature.id)"
              :class="{ clickable: permissions.canChangeConversionLevel }"
            >
              <ConversionLevel :feature="feature" with-date />
            </div>
          </td>
          <td style="width: 20%; text-align: right">
            <span v-if="isRota(feature)" :class="isRota(feature)"><i class="ri-exchange-funds-line"></i>ROTATION</span>

            <p class="fr-mb-0 fr-text--sm text-grey">
              {{ getTimeAgo(feature) }}
            </p>
          </td>
          <td style="width: 20%; text-align: right">
            <button
              type="button"
              @click.prevent="toggleDeleteForm(feature.id)"
              :disabled="!permissions.canDeleteFeature"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-btn--sm"
            >
              Supprimer la parcelle
            </button>
          </td>
          <td style="width: 20%; text-align: right; vertical-align: middle">
            <div>
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
          </td>
        </tr>
      </table>
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
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useRecordStore } from "@/stores/record.js";
import { useFeaturesStore } from "@/stores/features.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";

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
  isTab: {
    type: Boolean,
    default: false,
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
  let max = 0;
  if (feature.properties.historique) {
    feature.properties.historique.forEach((e) => {
      const tempo = feature.properties.historique.filter(
        (y) =>
          (y.annee_controle === e.annee_controle + 1 || y.annee_controle === e.annee_controle - 1) &&
          e.cultures.some((a) => y.cultures.some((e) => e.CPF === a.CPF)),
      ).length;
      if (!(tempo + 1 <= max)) max = tempo + 1;
    });
    return max >= 3 ? "rouge" : max > 1 ? "jaune" : null;
  } else return null;
}

watch(selectedIds, (selectedIds, prevSelectedIds) => {
  const newItems = featureIds.value.filter((id) => {
    return selectedIds.includes(id) && !prevSelectedIds.includes(id);
  });

  if (newItems.length === 1 && newItems.length !== featureIds.value.length) {
    open.value = true;
  }
});

function clickOn(id, event) {
  if (event.ctrlKey) {
    toggleSingleSelected(id);
  } else {
    toggleEditForm(id);
  }
}
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
</style>
