<template>
  <div>
    <div
      class="fr-grid-row fr-px-4v fr-py-4v groupe-parcelles"
      @click.stop="openLigne = !openLigne"
      @keydown.enter="openLigne = !openLigne"
      :class="{ 'groupe-titre-on': openLigne }"
    >
      <div class="fr-grid-row groupe-titre fr-mb-0">
        <div class="fr-checkbox-group fr-checkbox-group--sm">
          <input
            ref="groupCheckbox"
            type="checkbox"
            :id="'radio-' + featureGroup.key"
            :checked="allSelected"
            @click="toggleFeatureGroup"
          />

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
        <div class="fr-text fr-text--regular fr-mb-0 fr-grid-row fr-grid-row--middle">
          <span v-if="isGroupedByCulture" :class="getCultureIcon(featureGroup.key)" class="fr-mr-1v"></span>
          <p class="fr-sr-only">{{ groupErrors }} parcelles à amender</p>
          <span v-if="groupErrors" class="erreurs fr-grid-row fr-grid-row--middle fr-px-1v fr-mx-2v">
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
        <span class="font-blue">
          {{
            !isNaN(parseFloat(inHa(featureGroup.surface)))
              ? inHa(featureGroup.surface) + " ha"
              : inHa(featureGroup.surface)
          }}
        </span>

        <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="openLigne" aria-role="button" />
      </div>
    </div>
    <div
      class="fr-p-4v fr-mx-4v parcelle-ligne"
      :class="{ 'fr-grid-row': openLigne, 'fr-mt-2v': index === 0, 'carte-odd': index % 2 !== 0 }"
      :id="'parcelle-' + feature.id + '-ligne'"
      :hidden="!openLigne"
      v-for="(feature, index) in featureGroup.features"
      :key="feature.id"
      @click="(event) => clickOn(feature.id, event)"
    >
      <div class="fr-col-3 parcelle-info-col">
        <div class="fr-checkbox-group fr-checkbox-group--sm" @click.stop.prevent="handleClickChebox(feature.id)">
          <input type="checkbox" :id="'radio-' + feature.id" :checked="selectedIds.includes(feature.id)" />
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
        <div class="parcelle-content">
          <div class="parcelle-name-row">
            <span>{{ featureName(feature, { explicitName: false }) }}</span>
          </div>

          <span
            class="fr-hint-text"
            v-if="featureName(feature, { nameOnly: true }) && feature.properties.NUMERO_I != null"
          >
            {{ featureName(feature, { nameOnly: true }) }}
          </span>
          <div class="flex">
            <div
              class="fr-mt-1v"
              @click="openLigneNiveauConversionModal(feature.id)"
              :class="{ clickable: permissions.canChangeConversionLevel }"
            >
              <ConversionLevel :feature="feature" with-date noIcon />
            </div>
            <span class="fr-text--xs text-grey-vu fr-ml-1v fr-mt-1v fr-mb-0" v-if="feature.properties.controlee">
              <span aria-hidden="true" class="fr-icon--sm fr-icon-check-line"></span> Vu
            </span>
          </div>
        </div>
      </div>
      <div class="fr-col-2" v-if="!isGroupedByCulture">
        <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
          Multiculture
          <span class="fr-sr-only"> : </span>
          <br />

          <small v-for="(culture, i) in feature.properties.cultures" :key="i">
            <span v-if="i">, </span> {{ cultureLabel(culture) }}
          </small>
        </p>
        <button
          v-else-if="
            permissions.canChangeCulture &&
            (!feature.properties.cultures ||
              feature.properties.cultures.length === 0 ||
              (feature.properties.cultures &&
                feature.properties.cultures.length === 1 &&
                (feature.properties.cultures[0].CPF === '' || feature.properties.cultures[0].CPF === undefined)))
          "
          class="red radius fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-pencil-line"
          @click.stop.prevent="openLigneCulturesModal(feature.id)"
        >
          Culture
        </button>
        <p v-else class="fr-mb-0">
          {{ cultureLabel(feature.properties.cultures[0]) }}
        </p>
      </div>
      <div class="fr-col-2" v-else>
        <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">Multiculture</p>
        <p class="fr-my-auto" v-else>-</p>
      </div>
      <div v-if="isGroupedByCulture" style="position: relative" class="fr-col-2">
        <small style="position: absolute; top: -10px; left: 0; font-size: 0.625rem; color: #666; line-height: 1">
          Variété
        </small>
        <span
          v-if="
            !(
              feature.properties.cultures &&
              feature.properties.cultures.length > 0 &&
              feature.properties.cultures.find((e) => cultureLabel(e) === featureGroup.label)?.variete
            )
          "
          class="fr-mt-1v"
        >
          <small>Non rens.</small>
        </span>
        <span v-else class="fr-mt-1v">
          {{ feature.properties.cultures.find((e) => cultureLabel(e) === featureGroup.label).variete }}
        </span>
      </div>
      <div v-else style="position: relative" class="fr-col-2">
        <small style="position: absolute; top: -10px; left: 0; font-size: 0.625rem; color: #666; line-height: 1">
          Variété
        </small>
        <template v-for="(culture, i) in feature.properties.cultures" :key="i">
          <span v-if="i" class="">, </span>
          <span class="fr-mt-1v" v-if="!culture.variete"><small>Non rens.</small></span>
          <span v-else class="fr-mt-1v">{{ culture.variete }}</span>
        </template>
      </div>
      <div class="fr-col-2">
        <span>
          {{
            !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
              ? inHa(legalProjectionSurface(feature)) + "&nbsp;ha"
              : inHa(legalProjectionSurface(feature))
          }}
        </span>
      </div>
      <div class="fr-col-3 fr-grid-row last-row">
        <div class="fr-py-3v fr-px-2v">
          <span v-if="isRota(feature)" :class="isRota(feature)" class="fr-px-2v"
            ><i class="ri-exchange-funds-line"></i>ROTATION</span
          >
          <span
            v-if="feature.properties.commentaires || (feature.properties.auditeur_notes && permissions.isOc)"
            aria-hidden="true"
            class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire"
          >
            {{
              [feature.properties.commentaires, permissions.isOc ? feature.properties.auditeur_notes : null].filter(
                (e) => e != null,
              ).length
            }}
          </span>
          <br
            v-if="
              feature.properties.commentaires ||
              (feature.properties.auditeur_notes && permissions.isOc) ||
              isRota(feature)
            "
          />
          <span class="fr-text--xs text-grey fr-px-2v" v-if="getTimeAgo(feature)">
            Modifié {{ getTimeAgo(feature) }}
          </span>
        </div>
        <div class="fr-py-2v fr-px-1v">
          <button
            type="button"
            @click.prevent.stop="toggleDeleteForm(feature.id)"
            :disabled="!permissions.canDeleteFeature"
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line btn--error"
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
import { computed, ref, watch, nextTick, inject, onMounted } from "vue";
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
import { countRotationErrors } from "@/utils/culture";

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
  "toggle",
  "edit:featureId",
  "edit-niveau-conversion:featureId",
  "edit-cultures:featureId",
  "view:featureId",
  "delete:featureId",
  "zoom:featureId",
]);

const valueNull = ref(null);
const scroll = inject("scrollToFeatureId", valueNull);

const { selectedIds } = storeToRefs(featuresStore);
const { toggleSingleSelected, unselectAll } = featuresStore;

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id));
const openLigne = ref(
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

function handleClickChebox(featureIds) {
  toggleSingleSelected(featureIds);
  if (selectedIds.value.length > 1) {
    emit("edit:featureId", null);
  }
}

function toggleFeatureGroup() {
  if (allSelected.value) {
    featuresStore.unselect(...featureIds.value);
  } else {
    featuresStore.select(...featureIds.value);
  }
}

function openLigneNiveauConversionModal(id) {
  if (permissions.canChangeConversionLevel) {
    emit("edit-niveau-conversion:featureId", id);
  }
}

function openLigneCulturesModal(id) {
  if (permissions.canChangeConversionLevel) {
    emit("edit-cultures:featureId", id);
  }
}

function isRota(feature) {
  const count = countRotationErrors(0, feature.properties.historique);
  return count >= 3 ? "rouge" : count > 1 ? "jaune" : null;
}

watch(selectedIds, (selectedIds, prevSelectedIds) => {
  const newItems = featureIds.value.filter((id) => {
    return selectedIds.includes(id) && !prevSelectedIds.includes(id);
  });

  if (newItems.length === 1 && newItems.length !== featureIds.value.length) {
    openLigne.value = true;
  }
});

const haveToOpen = inject("openAll", valueNull);

watch(
  () => haveToOpen.value,
  (newState) => {
    if (newState.shouldOpen !== null) {
      openLigne.value = newState.shouldOpen;
      emit("toggle", newState.shouldOpen);
    }
  },
  { deep: true },
);

watch(
  () => openLigne.value,
  (newValue) => {
    emit("toggle", newValue);
  },
);

function clickOn(id, event) {
  if (event.ctrlKey || event.metaKey) {
    toggleSingleSelected(id);
    if (selectedIds.value.length > 1) {
      emit("edit:featureId", null);
    }
  } else {
    unselectAll();
    toggleSingleSelected(id);
    toggleEditForm(id);
  }
}

const someSelected = computed(() => {
  const selectedInGroup = featureIds.value.filter((id) => selectedIds.value.includes(id)).length;

  return selectedInGroup > 0 && selectedInGroup < featureIds.value.length;
});

const groupCheckbox = ref(null);

watch([allSelected, someSelected], () => {
  if (groupCheckbox.value) {
    groupCheckbox.value.indeterminate = someSelected.value;
  }
});
onMounted(async () => {
  if (scroll.value != null && props.featureGroup.features.some((e) => e.id === scroll.value)) {
    open.value = true;
    await nextTick();
    if (document.getElementById("parcelle-" + scroll.value)) {
      const element = document.getElementById("parcelle-" + scroll.value);
      const y = element.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
      window.scrollTo({ top: y, behavior: "smooth" });
      scroll.value = null;
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
    color: var(--light-decisions-text-text-action-high-blue-france, #000091);
    gap: 7px;
  }

  .groupe-titre > h3 {
    height: 40px;
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

.text-grey {
  color: var(--grey-625-425);
}

.badge-commentaire {
  background-color: var(--blue-france-950-100);
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

.parcelle-ligne {
  border-bottom: 1px solid var(--light-decisions-artwork-artwork-decorative-blue-france, #ececfe);
  position: relative;
  align-items: center;

  &.background-selected,
  &[aria-current="location"] {
    cursor: pointer;
    background: var(--light-options-primary-color-975-active-blue-france-975-active, #cbcbfa);
  }

  &:hover {
    background: var(--light-options-primary-color-975-hover-blue-france-975-hover, #dcdcfc);
  }
}

.last-row {
  display: flex;
  justify-content: flex-end;
  gap: 0;
}

.flex {
  display: flex;
}

.label-group {
  max-width: 30ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.groupe-titre-on {
  background-color: var(--blue-france-925-125);
}
.fr-checkbox-group input[type="checkbox"]:indeterminate + label::before {
  background-color: var(--background-active-blue-france);
  border-color: var(--background-active-blue-france);

  background-image: linear-gradient(to right, transparent 20%, white 20%, white 80%, transparent 80%);

  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 2px;
}

.font-blue {
  color: var(--light-decisions-text-text-action-high-blue-france, #000091);
}

.text-grey-vu {
  display: flex;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 2px;
  width: fit-content;

  border-radius: 12px;
  background: var(--light-decisions-background-background-contrast-grey, #eee);
}

.carte-odd {
  background-color: var(--background-alt-blue-france);
}

.text-grey {
  color: var(--grey-625-425);
}

.parcelle-info-col {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.parcelle-content {
  flex: 1;
}

.parcelle-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
