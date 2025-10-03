<template>
  <Modal v-bind="$attrs" data-track-content data-content-name="Modale de modification multiple de la culture">
    <template #title>Modification du type de culture</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelles</b>.
      </p>
    </div>
    <AccordionGroup>
      <AccordionSection title="Parcelles à modifier">
        <ul class="fr-mt-2w">
          <li v-for="f in selectedFeatures" :key="f.id">
            {{ f.properties.nom ? f.properties.nom + " - " : "" }}
            {{ f.properties.NUMERO_I ? " Ilot : " + f.properties.NUMERO_I : "" }}
            {{ f.properties.NUMERO_P ? " Parcelle : " + f.properties.NUMERO_P : "" }}
          </li>
        </ul>
      </AccordionSection>
    </AccordionGroup>

    <form id="mass-edit-form" @submit.prevent="validate">
      <div class="fr-tabs fr-mt-2w">
        <ul class="fr-tabs__list" role="tablist" aria-label="onglet de sélection">
          <li role="presentation">
            <button
              type="button"
              class="fr-tabs__tab"
              :class="{ 'fr-tabs__tab--active': activeTab === 0 }"
              role="tab"
              :aria-selected="activeTab === 0"
              @click="activeTab = 0"
            >
              Cultures
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              class="fr-tabs__tab"
              :class="{ 'fr-tabs__tab--active': activeTab === 1 }"
              role="tab"
              :aria-selected="activeTab === 1"
              @click="activeTab = 1"
            >
              Certification
            </button>
          </li>
        </ul>

        <div v-show="activeTab === 0" class="fr-tabs__panel fr-tabs__panel--selected" role="tabpanel">
          <CultureSelector :cultures="patch.cultures" @change="($cultures) => (patch.cultures = $cultures)" />
        </div>

        <div v-show="activeTab === 1" class="fr-tabs__panel fr-tabs__panel--selected" role="tabpanel">
          <ConversionLevelSelector v-model="patch.conversion_niveau" />

          <div class="fr-input-group">
            <label class="fr-label">Date de début de conversion</label>
            <input
              type="date"
              class="fr-input"
              v-model="patch.engagement_date"
              :required="isEngagementDateRequired"
              name="engagement_date"
              min="1985-01-01"
              :max="maxDate"
              ref="autofocusedElement"
            />
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-md">
        <li>
          <button class="fr-btn" form="mass-edit-form" aria-label="Enregistrer les changements">Enregistrer</button>
        </li>
        <li>
          <button
            type="button"
            class="fr-btn fr-btn--tertiary"
            @click="resetPatch"
            :disabled="!(changes != {} && Object.keys(changes).length > 0)"
          >
            Réinitialiser
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useFeaturesStore } from "@/stores/features.js";
import { toDateInputString } from "@/utils/dates.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { LEVEL_C1, LEVEL_C2, LEVEL_C3 } from "@/referentiels/ab.js";

import Modal from "@/components/widgets/Modal.vue";
import CultureSelector from "@/components/forms/fields/CultureSelector.vue";
import ConversionLevelSelector from "@/components/forms/fields/ConversionLevelSelector.vue";

import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";

const emit = defineEmits(["submit"]);
const featuresSet = useFeaturesSetsStore();

const store = useFeaturesStore();
const { selectedIds } = storeToRefs(store);

const initial = {
  cultures: [{ CPF: "" }],
  conversion_niveau: "",
  engagement_date: "",
};

const validationErrors = ref([]);

const activeTab = ref(0);

const patch = reactive({ ...initial });

const maxDate = computed(() => toDateInputString(new Date()));

const changes = computed(() => {
  const diff = {};
  if (JSON.stringify(patch.cultures.map(({ id, ...rest }) => rest)) !== JSON.stringify(initial.cultures)) {
    diff.cultures = patch.cultures;
  }
  if (patch.conversion_niveau !== initial.conversion_niveau) {
    diff.conversion_niveau = patch.conversion_niveau;
  }
  if (patch.engagement_date !== initial.engagement_date) {
    diff.engagement_date = patch.engagement_date;
  }
  return diff;
});

const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3, ""].includes(patch.conversion_niveau));

const selectedFeatures = computed(() => {
  const coll = store.collection;
  const ids = store.selectedIds;
  if (!coll || !Array.isArray(coll.features)) return [];
  const idSet = new Set(ids.map(String));
  return coll.features.filter((f) => idSet.has(String(f.id)));
});

const footerMsg = computed(() => {
  if (validationErrors.value.length) {
    return validationErrors.value;
  }

  const msgs = [];
  if ("cultures" in changes.value) {
    msgs.push("La culture a été modifiée");
  }
  if ("conversion_niveau" in changes.value) {
    msgs.push("Le niveau de conversion a été modifié");
  }
  if ("engagement_date" in changes.value) {
    msgs.push("La date de conversion a été modifiée");
  }
  return msgs;
});

const validate = () => {
  const errs = [];

  if (
    "cultures" in changes.value &&
    (!patch.cultures.length || patch.cultures.some((c) => !c.CPF || c.CPF.trim() === ""))
  ) {
    errs.push("Une culture sans code CPF n'est pas autorisée.");
  }

  if (["C1", "C2", "C3"].includes(patch.conversion_niveau) && !patch.engagement_date) {
    errs.push("La date de début de conversion est obligatoire pour C1, C2 ou C3.");
  }

  if (errs.length) {
    validationErrors.value = errs;
    return;
  }

  validationErrors.value = [];

  if (Object.keys(changes.value).length === 0) return;

  selectedIds.value.forEach((featureId) => {
    const set = featuresSet.byFeature(featureId, true);

    if ("cultures" in changes.value && set.has("culture-unsure")) {
      console.warn(`La culture est incertaine pour la feature ${featureId}`);
      return false;
    }

    if (
      ("conversion_niveau" in changes.value || "engagement_date" in changes.value) &&
      set.has("conversion-level-unsure")
    ) {
      console.warn(`Le niveau de conversion est incertain pour la feature ${featureId}`);
      return false;
    }
  });

  emit("submit", { ids: selectedIds.value, patch: changes.value });
};

const resetPatch = () => {
  Object.assign(patch, initial);
};
</script>

<style scoped>
.fr-btns-group > li > button {
  height: fit-content !important;
  align-items: center;
}

.fr-btns-group > li {
  align-items: center;
}

.footer-msg {
  text-align: center;
}
</style>
