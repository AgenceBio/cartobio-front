<template>
  <div class="fr-input-group" :class="{ 'fr-input-group--error': hasErrors }">
    <label class="fr-label">Niveau de conversion</label>

    <div class="fr-radio-group fr-my-1w" v-for="niveau in conversionLevels" :key="niveau.value">
      <input
        type="radio"
        :id="'conversion-' + niveau.value"
        :value="niveau.value"
        v-bind:disabled="readonly"
        :checked="niveau.value === modelValue"
        @change="emit('update:modelValue', niveau.value)"
        name="conversion_niveau"
      />
      <label class="fr-label" :for="'conversion-' + niveau.value">
        {{ niveau.label }}
      </label>
    </div>

    <div v-for="[id, result] in errors" :key="id" class="fr-hint-text fr-error-text">{{ result.errorMessage }}.</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { userFacingConversionLevels as conversionLevels } from "@/referentiels/ab.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";

const props = defineProps({
  featureId: {
    type: String,
  },
  modelValue: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const featuresSets = useFeaturesSetsStore();
const errors = computed(() => featuresSets.byFeatureProperty(props.featureId, "conversion_niveau"));
const hasErrors = computed(() => errors.value.size > 0);
</script>
