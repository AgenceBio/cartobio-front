<template>
  <div>
    <div v-if="!disabledInput">
      <fieldset
        class="culture-group fr-mb-1w fr-p-2w"
        :key="uuidedCultures[0].id"
        ref="fieldsetCultureGroup"
        tabindex="-1"
      >
        <AsyncCultureTypeSelector
          :disabled-input="disabledInput"
          :feature-id="featureId"
          :culture="uuidedCultures[0]"
          :modelValue="uuidedCultures[0].CPF"
          @update:modelValue="($CPF) => updateCulture(uuidedCultures[0].id, 'CPF', $CPF)"
        />

        <button
          type="button"
          v-if="!disabledInput"
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-up-line fr-btn--icon-right fr-mb-3w"
          @click="openMulticultureModal"
        >
          Saisie multiculture
        </button>

        <div class="fr-input-group">
          <label class="fr-label" :for="`variete-${uuidedCultures[0].id}`">Variété (facultatif)</label>
          <div class="fr-hint-text">Précisions sur la culture, le cépage, etc.</div>
          <div class="fr-input-wrap">
            <input
              type="text"
              class="fr-input"
              :id="`variete-${uuidedCultures[0].id}`"
              :value="uuidedCultures[0].variete"
              @input="updateCulture(uuidedCultures[0].id, 'variete', $event.target.value)"
              name="variete"
              :disabled="disabledInput"
            />
          </div>
        </div>

        <div class="horizontal-stack">
          <div class="fr-input-group">
            <label class="fr-label" :for="`superficie-${uuidedCultures[0].id}`">Superficie (Ha)</label>
            <div class="fr-hint-text">(facultatif)</div>
            <input
              type="number"
              min="0"
              step="0.00001"
              class="fr-input"
              :id="`superficie-${uuidedCultures[0].id}`"
              :value="uuidedCultures[0].surface"
              @input="updateCulture(uuidedCultures[0].id, 'surface', $event.target.value)"
              name="surface"
              :disabled="disabledInput"
            />
          </div>

          <div class="fr-input-group">
            <label class="fr-label" :for="`date_semis-${uuidedCultures[0].id}`">Date des semis </label>
            <div class="fr-hint-text">(facultatif)</div>
            <input
              type="date"
              class="fr-input"
              :id="`date_semis-${uuidedCultures[0].id}`"
              :value="uuidedCultures[0].date_semis"
              @input="updateCulture(uuidedCultures[0].id, 'date_semis', $event.target.value)"
              name="date_semis"
              :disabled="disabledInput"
            />
          </div>
        </div>
      </fieldset>
    </div>
    <div v-else>
      <fieldset
        class="culture-group fr-mb-1w fr-p-2w"
        :key="uuidedCultures[0].id"
        ref="fieldsetCultureGroup"
        tabindex="-1"
      >
        <p class="fr-h5">Culture</p>
        <p>
          <span :class="getCultureIcon(uuidedCultures[0].CPF)"> </span>
          {{ fromCodeCpf(uuidedCultures[0].CPF).libelle_code_cpf }}
        </p>

        <div class="fr-input-group">
          <label class="fr-label" :for="`variete-${uuidedCultures[0].id}`">Variété</label>
          <div class="fr-input-wrap">
            {{ uuidedCultures[0].variete ? uuidedCultures[0].variete : "Non renseignée" }}
          </div>
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`superficie-${uuidedCultures[0].id}`">
            <span> <i class="ri-custom-size"></i></span> Surface
          </label>
          {{ uuidedCultures[0].surface ? uuidedCultures[0].surface : "Non renseignée" }}
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`date_semis-${uuidedCultures[0].id}`">
            <span class="fr-icon-calendar-line"> </span> Date des semis
          </label>
          {{ uuidedCultures[0].date_semis ? uuidedCultures[0].date_semis : "Non renseignée" }}
        </div>
      </fieldset>
    </div>

    <Modal @close="closeMulticultureModal()" v-if="isMulticultureModalOpen" large="true">
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
              <th>Type de culture</th>
              <th>Variété</th>
              <th>Superficie (Ha)</th>
              <th>Date des semis</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="culture in uuidedCultures" :key="culture.id">
              <td>
                <AsyncCultureTypeSelector
                  :needTitle="false"
                  :culture="culture"
                  :modelValue="culture.CPF"
                  :disabledAutoComplete="!isMulticulture && culture !== uuidedCultures[0]"
                  :disabledInput="!isMulticulture && culture !== uuidedCultures[0]"
                  @update:modelValue="($CPF) => updateCulture(culture.id, 'CPF', $CPF)"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="fr-input"
                  v-model="culture.variete"
                  :disabled="!isMulticulture && culture !== uuidedCultures[0]"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.00001"
                  class="fr-input"
                  v-model="culture.surface"
                  :disabled="!isMulticulture && culture !== uuidedCultures[0]"
                />
              </td>
              <td>
                <input
                  type="date"
                  class="fr-input"
                  v-model="culture.date_semis"
                  :disabled="!isMulticulture && culture !== uuidedCultures[0]"
                />
              </td>
              <td>
                <button
                  type="button"
                  v-if="isMulticulture && canBeDeleted"
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
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useFocus } from "@vueuse/core";
import Modal from "@/components/widgets/Modal.vue";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { getCultureIcon } from "@/utils/features.js";

const AsyncCultureTypeSelector = defineAsyncComponent(() => import("./CultureTypeSelector.vue"));
const fieldsetCultureGroup = ref();
const isMulticultureModalOpen = ref(false);

const isMulticulture = ref(false);

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

const emit = defineEmits(["change"]);

const uuidedCultures = computed(() => {
  const uuidRegex =
    /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  return props.cultures.map((culture) => ({
    ...culture,
    id: culture.id && uuidRegex.test(culture.id) ? culture.id : crypto.randomUUID(),
    // variete: '',
    // date_semis: '',
    // superficie: ''
  }));
});

function openMulticultureModal() {
  isMulticultureModalOpen.value = true;
  updateEditableCulture();
}

function closeMulticultureModal() {
  if (!isMulticulture.value && uuidedCultures.value.length > 1) {
    emit("change", [uuidedCultures.value[0]]);
  }
  isMulticultureModalOpen.value = false;
}

function updateEditableCulture() {
  const last = uuidedCultures.value[uuidedCultures.value.length - 1].CPF;
  if (last) {
    appendEmptyCulture();
  }
}

watch(
  uuidedCultures,
  () => {
    if (isMulticultureModalOpen.value === true) {
      updateEditableCulture();
    }
  },
  { deep: true },
);

watch(
  fieldsetCultureGroup,
  () => {
    const { focused } = useFocus(fieldsetCultureGroup.value[fieldsetCultureGroup.value.length - 1]);
    focused.value = true;
  },
  { deep: true },
);

watch(isMulticulture, (val) => {
  if (val) {
    if (uuidedCultures.value.length === 1) {
      appendEmptyCulture();
    }
  }
});

const canBeDeleted = computed(() => uuidedCultures.value.length > 1);

function appendEmptyCulture() {
  const appendedCultures = [
    ...uuidedCultures.value,
    {
      CPF: "",
      id: crypto.randomUUID(),
    },
  ];

  emit("change", appendedCultures);
}

watch(
  fieldsetCultureGroup,
  () => {
    const { focused } = useFocus(fieldsetCultureGroup.value[fieldsetCultureGroup.value.length - 1]);

    focused.value = true;
  },
  { deep: true },
);

function removeCulture(cultureId) {
  const updatedCultures = uuidedCultures.value.filter(({ id }) => id !== cultureId);
  if (updateCultures.length === 1 && isMulticultureModalOpen.value === true) isMulticultureModalOpen.value = false;
  emit("change", updatedCultures);
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
</style>
