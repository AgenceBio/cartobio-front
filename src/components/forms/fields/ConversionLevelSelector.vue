<template>
  <div class="fr-input-group" :class="{ 'fr-input-group--error': hasErrors }">
    <label class="fr-label">Niveau de conversion</label>

    <div
      class="fr-radio-group fr-radio-group--sm fr-my-1w fr-p-2w"
      v-for="niveau in conversionLevels"
      :key="niveau.value"
    >
      <input
        type="radio"
        :id="'conversion-' + niveau.value + (modal ? '-modal' : '')"
        :value="niveau.value"
        :disabled="readonly"
        :checked="niveau.value === modelValue"
        @change="emit('update:modelValue', niveau.value)"
        name="conversion_niveau"
      />
      <label class="fr-label" :for="'conversion-' + niveau.value + (modal ? '-modal' : '')">
        {{ niveau.label }}
      </label>

      <div class="end-conversion">
        <ConversionLevel :level="niveau" :noIcon="true" :labelSelector="true" />
      </div>
    </div>

    <div v-for="[id, result] in errors" :key="id" class="fr-hint-text fr-error-text">{{ result.errorMessage }}.</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { userFacingConversionLevels as conversionLevels } from "@/referentiels/ab.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";

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
    default: false,
  },
  modal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const featuresSets = useFeaturesSetsStore();
const errors = computed(() => featuresSets.byFeatureProperty(props.featureId, "conversion_niveau"));
const hasErrors = computed(() => errors.value.size > 0);
</script>

<style scoped>
.fr-radio-group {
  display: flex;
  align-items: center;
  border: 1px solid #e5e5e5;
  padding: 12px 16px;
  margin-bottom: 12px;
  background-color: #fff;
  min-width: 100%;
}

.end-conversion {
  border-left: 1px solid black;
  min-height: 100%;
  max-width: 100px;
  justify-content: flex-end;
  margin-right: 0px;
  margin-left: auto;
  min-width: 100px;
}

.end-conversion > div {
  width: fit-content;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}
</style>
