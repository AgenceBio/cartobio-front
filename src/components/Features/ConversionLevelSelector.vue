<template>
  <div class="fr-input-group">
    <label class="fr-label">Niveau de conversion</label>

    <div class="fr-radio-group fr-my-1w" v-for="niveau in conversionLevels" :key="niveau.value">
      <input type="radio" :id="'conversion-' + niveau.value" :value="niveau.value" :readonly="readonly" :checked="niveau.value === modelValue" @change="emit('update:modelValue', niveau.value)" name="conversion_niveau">
      <label class="fr-label" :for="'conversion-' + niveau.value">
        {{ niveau.label }}
      </label>
    </div>

    <div v-if="modelValue === LEVEL_UNKNOWN" class="fr-hint-text fr-error-text">
      Le niveau de conversion a besoin d'être indiqué.
    </div>
    <div v-if="modelValue === LEVEL_MAYBE_AB" class="fr-hint-text fr-error-text">
      Le niveau de conversion en agriculture biologique a besoin d'être précisé.
    </div>
  </div>
</template>

<script setup>
import { LEVEL_UNKNOWN, LEVEL_MAYBE_AB, userFacingConversionLevels as conversionLevels } from '@/referentiels/ab.js';

defineProps({
  modelValue: {
    type: String,
    required: true
  },
  readonly: {
    type: Boolean,
    default: () => false
  }
})
const emit = defineEmits(['update:modelValue'])
</script>
