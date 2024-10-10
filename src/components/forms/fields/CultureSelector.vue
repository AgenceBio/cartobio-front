<template>
  <fieldset class="culture-group fr-card fr-mb-1w fr-p-2w" v-for="culture in uuidedCultures" :key="culture.id">
    <AsyncCultureTypeSelector
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
          autocomplete="cartobio-variete"
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
        <label class="fr-label" :for="`superficie-${culture.id}`">Superficie (facultatif)</label>
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
        <div class="fr-hint-text">Exprimée en <abbr title="hectare">ha</abbr>.</div>
      </div>

      <div class="fr-input-group">
        <label class="fr-label" :for="`date_semis-${culture.id}`">Date des semis (facultatif)</label>
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
      @click="removeCulture(culture.id)"
    >
      Supprimer
    </button>
  </fieldset>

  <button
    type="button"
    v-if="!disabledInput"
    class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
    @click="appendEmptyCulture"
  >
    Ajouter une autre culture
  </button>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";

const AsyncCultureTypeSelector = defineAsyncComponent(() => import("./CultureTypeSelector.vue"));

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
    default: () => false,
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

function removeCulture(cultureId) {
  const updatedCultures = uuidedCultures.value.filter(({ id }) => id !== cultureId);

  emit("change", updatedCultures);
}

function updateCulture(cultureId, field, value) {
  const updatedCultures = uuidedCultures.value.map((culture) =>
    culture.id === cultureId
      ? {
          ...culture,
          [field]: value,
        }
      : culture
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
</style>
