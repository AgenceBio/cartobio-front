<template>
  <div>
    <div v-if="!disabledInput">
      <button
        type="button fr-mt-2v"
        v-if="!disabledInput"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-up-line fr-btn--icon-right fr-mb-3w"
        @click.prevent="openMulticultureModal"
      >
        Saisie multiculture
      </button>
      <fieldset
        class="culture-group fr-mb-1w fr-p-2w fr-pt-1w"
        :key="culture.id"
        v-for="culture in uuidedCultures"
        tabindex="-1"
      >
        <AsyncCultureTypeSelector
          :key="culture.CPF"
          :disabled-input="disabledInput"
          :feature-id="featureId"
          :culture="culture"
          :modelValue="culture.CPF"
          @update:modelValue="($CPF) => updateCulture(culture.id, 'CPF', $CPF)"
        />

        <div class="fr-input-group">
          <label class="fr-label" :for="`variete-${culture.id}`">Variété (facultatif)</label>
          <div class="fr-hint-text">Précisions sur la culture, le cépage, etc.</div>
          <div class="fr-input-wrap">
            <input
              type="text"
              class="fr-input"
              :id="`variete-${culture.id}`"
              :value="culture.variete"
              @input="updateCulture(culture.id, 'variete', $event.target.value)"
              name="variete"
              :disabled="disabledInput"
            />
          </div>
        </div>

        <div class="horizontal-stack">
          <div class="fr-input-group">
            <label class="fr-label" :for="`superficie-${culture.id}`">Superficie (Ha)</label>
            <div class="fr-hint-text">(facultatif)</div>
            <input
              type="number"
              min="0"
              step="0.00001"
              class="fr-input"
              :id="`superficie-${culture.id}`"
              :value="culture.surface"
              @input="updateCulture(culture.id, 'surface', $event.target.value)"
              name="surface"
              :disabled="disabledInput"
            />
          </div>

          <div class="fr-input-group">
            <label class="fr-label" :for="`date_semis-${culture.id}`">Date des semis </label>
            <div class="fr-hint-text">(facultatif)</div>
            <input
              type="date"
              class="fr-input"
              :id="`date_semis-${culture.id}`"
              :value="culture.date_semis"
              @input="updateCulture(culture.id, 'date_semis', $event.target.value)"
              name="date_semis"
              :disabled="disabledInput"
            />
          </div>
        </div>
        <button
          type="button"
          v-if="!disabledInput"
          class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line fr-btn--icon-left"
          :disabled="!canBeDeleted"
          @click="removeCultureOld(culture.id)"
          aria-label="Supprimer la culture"
        >
          Supprimer
        </button>
      </fieldset>
    </div>
    <div v-else>
      <fieldset
        class="culture-group fr-mb-1w fr-p-2w"
        v-for="culture in uuidedCultures"
        :key="culture.id"
        tabindex="-1"
      >
        <p class="fr-h5">Culture</p>
        <p>
          <span :class="getCultureIcon(culture.CPF)"> </span>
          {{ fromCodeCpf(culture.CPF).libelle_code_cpf }}
        </p>

        <div class="fr-input-group">
          <label class="fr-label" :for="`variete-${culture.id}`">Variété</label>
          <div class="fr-input-wrap">
            {{ culture.variete ? culture.variete : "Non renseignée" }}
          </div>
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`superficie-${culture.id}`">
            <span> <i class="ri-custom-size"></i></span> Surface
          </label>
          {{ culture.surface ? culture.surface : "Non renseignée" }}
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`date_semis-${culture.id}`">
            <span class="fr-icon-calendar-line"> </span> Date des semis
          </label>
          {{ culture.date_semis ? culture.date_semis : "Non renseignée" }}
        </div>
      </fieldset>
    </div>
    <Teleport to="body">
      <Modal @close="closeWithoutSave()" v-if="isMulticultureModalOpen" large>
        <template #title>Saisie multiculture</template>

        <div class="fr-toggle fr-toggle--label-left fr-mb-2w">
          <input type="checkbox" id="toggle-multiculture" class="fr-toggle__input" v-model="isMulticulture" />
          <label
            class="fr-toggle__label"
            for="toggle-multiculture"
            data-fr-checked-label="Oui"
            data-fr-unchecked-label="Non"
          >
            Multiculture
          </label>
        </div>

        <div>
          <table class="culture-table">
            <thead>
              <tr>
                <th>Culture</th>
                <th>Variété</th>
                <th>Superficie (Ha)</th>
                <th>Date des semis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="culture in multiCultureTab" :key="culture.id">
                <td>
                  <AsyncCultureTypeSelector
                    :needTitle="false"
                    :culture="culture"
                    :modelValue="culture.CPF"
                    :disabledAutoComplete="!isMulticulture && culture !== multiCultureTab[0]"
                    :disabledInput="!isMulticulture && culture !== multiCultureTab[0]"
                    @update:modelValue="($CPF) => updateCultureTempo(culture.id, 'CPF', $CPF)"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    class="fr-input"
                    v-model="culture.variete"
                    :disabled="!isMulticulture && culture !== multiCultureTab[0]"
                    @input="updateCultureTempo(culture.id, 'variete', $event.target.value)"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.00001"
                    class="fr-input"
                    v-model="culture.surface"
                    :disabled="!isMulticulture && culture !== multiCultureTab[0]"
                    @input="updateCultureTempo(culture.id, 'surface', $event.target.value)"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    class="fr-input"
                    v-model="culture.date_semis"
                    :disabled="!isMulticulture && culture !== multiCultureTab[0]"
                    @input="updateCultureTempo(culture.id, 'date_semis', $event.target.value)"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    v-if="isMulticulture && canBeDeletedModal"
                    class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line"
                    @click="removeCulture(culture.id)"
                    aria-label="Supprimer la culture"
                  ></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template #footer>
          <button class="fr-btn" @click="closeMulticultureModal()">Enregistrer</button>
        </template>
      </Modal>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, watch } from "vue";
import Modal from "@/components/widgets/Modal.vue";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { getCultureIcon } from "@/utils/features.js";

const AsyncCultureTypeSelector = defineAsyncComponent(() => import("./CultureTypeSelector.vue"));
const isMulticultureModalOpen = ref(false);

const props = defineProps({
  cultures: {
    type: Array,
    required: true,
  },
  featureId: {
    type: String,
  },
  disabledInput: {
    type: Boolean,
    default: false,
  },
});

const isMulticulture = ref(false);
const multiCultureTab = ref([]);
const emit = defineEmits(["change"]);

const uuidedCultures = computed(() => {
  const uuidRegex =
    /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  if (props.cultures.length === 0) return [{ id: crypto.randomUUID(), variete: "", date_semis: "", superficie: "" }];
  return props.cultures.map((culture) => ({
    ...culture,
    id: culture.id && uuidRegex.test(culture.id) ? culture.id : crypto.randomUUID(),
    // variete: '',
    // date_semis: '',
    // superficie: ''
  }));
});

function closeWithoutSave() {
  isMulticultureModalOpen.value = false;
  multiCultureTab.value = [];
}

function openMulticultureModal() {
  isMulticultureModalOpen.value = true;
  multiCultureTab.value = uuidedCultures.value;
  isMulticulture.value = true;
  updateEditableCulture();
}

function closeMulticultureModal() {
  let updatedCultures = [];

  if (isMulticulture.value) {
    updatedCultures = multiCultureTab.value.filter((c) => c.CPF || c.variete || c.surface || c.date_semis);
  } else if (uuidedCultures.value.length > 1) {
    updatedCultures = [multiCultureTab.value[0]];
  }

  emit("change", updatedCultures);
  isMulticultureModalOpen.value = false;
}

function updateEditableCulture() {
  const last = multiCultureTab.value[multiCultureTab.value.length - 1].CPF;
  if (last) {
    appendEmptyCulture();
  }
}

watch(
  uuidedCultures,
  () => {
    multiCultureTab.value = uuidedCultures.value;
    if (isMulticultureModalOpen.value === true) {
      updateEditableCulture();
    }
  },
  { deep: true },
);

watch(
  multiCultureTab.value,
  () => {
    if (isMulticultureModalOpen.value === true) {
      updateEditableCulture();
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.cultures,
  (newVal) => {
    isMulticulture.value = newVal.length > 1;
  },
  { immediate: true, deep: true },
);

watch(isMulticulture, (val) => {
  if (val) {
    if (multiCultureTab.value.length === 1) {
      appendEmptyCulture();
    }
  }
});

const canBeDeletedModal = computed(() => multiCultureTab.value.length > 1);
const canBeDeleted = computed(() => uuidedCultures.value.length > 1);
function appendEmptyCulture() {
  const appendedCultures = [
    ...multiCultureTab.value,
    {
      CPF: "",
      id: crypto.randomUUID(),
    },
  ];
  multiCultureTab.value = appendedCultures;
}

function appendEmptyCultureUUID() {
  const appendedCultures = [
    ...uuidedCultures.value,
    {
      CPF: "",
      id: crypto.randomUUID(),
    },
  ];

  emit("change", appendedCultures);
}

function removeCulture(cultureId) {
  multiCultureTab.value = multiCultureTab.value.filter(({ id }) => id !== cultureId);
}

function updateCulture(cultureId, field, value) {
  const updatedCultures = uuidedCultures.value.map((culture) =>
    culture.id === cultureId
      ? {
          ...culture,
          [field]: value,
        }
      : culture,
  );

  emit("change", updatedCultures);
}

function updateCultureTempo(cultureId, field, value) {
  multiCultureTab.value = multiCultureTab.value.map((culture) =>
    culture.id === cultureId
      ? {
          ...culture,
          [field]: value,
        }
      : culture,
  );
  updateEditableCulture();
}

function removeCultureOld(cultureId) {
  const updatedCultures = uuidedCultures.value.filter(({ id }) => id !== cultureId);

  emit("change", updatedCultures);
}
</script>

<style scoped>
.culture-group {
  margin-left: 0;
  margin-right: 0;
  border: 0;
}

.horizontal-stack {
  display: flex;
  justify-content: space-between;
  gap: 1em;
  margin-bottom: 1rem;
}

.horizontal-stack > .fr-input-group {
  flex-grow: 1;
}
td > input {
  margin-top: 0.5rem;
}

td > .fr-input-group {
  margin-top: 0.5rem;
}

tr {
  text-align: start;
}
</style>
