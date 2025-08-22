<template>
  <div>
    <div
      class="fr-grid-row fr-mb-2v fr-px-4v fr-py-4v groupe-parcelles"
      @click.stop="openLigne = !openLigne"
      @keydown.enter="openLigne = !openLigne"
      :class="{ 'groupe-titre-on': openLigne }"
    >
      <div class="fr-grid-row groupe-titre fr-mb-0">
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
          />
        </div>
        <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="openLigne" aria-role="button" />
      </div>
    </div>
    <div
      class="fr-mb-2v fr-p-4v fr-mx-4v parcelle-ligne"
      :class="{ 'fr-grid-row': openLigne }"
      :id="'parcelle-' + feature.id + '-ligne'"
      :hidden="!openLigne"
      v-for="feature in featureGroup.features"
      :key="feature.id"
      @click="(event) => clickOn(feature.id, event)"
    >
      <div class="fr-col-2">
        <h4
          class="fr-text--lg fr-mb-0"
          :class="{
            'fr-icon fr-icon-checkbox-fill fr-icon fr-icon--lg fr-icon--left controlee': feature.properties.controlee,
          }"
        >
          {{ featureName(feature, { explicitName: false }) }}
        </h4>
        <p class="fr-hint-text" v-if="featureName(feature, { nameOnly: true })">
          {{ featureName(feature, { nameOnly: true }) }}
        </p>
      </div>

      <div class="fr-col-2">
        {{
          feature.properties.cultures &&
          feature.properties.cultures.length > 0 &&
          feature.properties.cultures[0].variete
            ? feature.properties.cultures[0].variete
            : "-"
        }}
      </div>
      <div class="fr-col-2">
        <p v-if="feature.properties.cultures.length > 1" class="fr-mb-0">
          Multiculture <span class="fr-sr-only"> : </span>
          <small v-for="(culture, i) in feature.properties.cultures" :key="i">
            <span v-if="i" class="fr-sr-only">, </span> {{ cultureLabel(culture) }}
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
        <p v-else class="fr-mb-0">{{ cultureLabel(feature.properties.cultures[0]) }}</p>
      </div>
      <div class="fr-col-1">
        <span>
          {{
            !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
              ? inHa(legalProjectionSurface(feature)) + "&nbsp;ha"
              : inHa(legalProjectionSurface(feature))
          }}
        </span>
      </div>
      <div class="fr-col-2">
        <div
          style="width: fit-content"
          @click="openLigneNiveauConversionModal(feature.id)"
          :class="{ clickable: permissions.canChangeConversionLevel }"
        >
          <ConversionLevel :feature="feature" with-date />
        </div>
      </div>
      <div class="fr-col-3 fr-grid-row last-row">
        <div class="fr-py-3v fr-px-2v">
          <span v-if="isRota(feature)" :class="isRota(feature)" class="fr-px-2v"
            ><i class="ri-exchange-funds-line"></i>ROTATION</span
          >
          <span class="fr-text--sm text-grey fr-px-2v">
            {{ getTimeAgo(feature) }}
          </span>
          <span
            v-if="feature.properties.commentaires || feature.properties.auditeur_notes"
            aria-hidden="true"
            class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire"
          >
            {{ [feature.properties.commentaire, feature.properties.auditeur_notes].filter((e) => e != null).length }}
          </span>
        </div>
        <div class="fr-py-1v">
          <button
            type="button"
            @click.prevent="toggleDeleteForm(feature.id)"
            :disabled="!permissions.canDeleteFeature"
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error"
          >
            Supprimer la parcelle
          </button>
        </div>
        <div class="fr-py-3v">
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

const valueNull = ref(null);
const scrool = inject("scroolToFeatureId", valueNull);

const { selectedIds } = storeToRefs(featuresStore);
const { toggleSingleSelected } = featuresStore;

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
    openLigne.value = true;
  }
});

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
  color: var(--text-default-error);
  border: 1px solid var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border-radius: 4px;
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

.groupe-parcelles {
  gap: 12px;
  justify-content: space-between;
  border-top: 1px solid var(--artwork-decorative-blue-france);
  border-bottom: 1px solid var(--artwork-decorative-blue-france);

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

.parcelle-ligne {
  border: 1px solid #ececfe;
  position: relative;
  align-items: center;
}
.last-row {
  display: flex;
  justify-content: flex-end;
  gap: 0;
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
</style>
