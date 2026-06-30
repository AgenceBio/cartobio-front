<template>
  <div class="fr-input-group" :class="{ 'fr-input-group--error': hasErrors }">
    <label class="fr-label">Niveau de conversion</label>
    <div
      class="fr-radio-group fr-radio-group--sm fr-my-1w"
      @click.capture="readonly && $event.preventDefault()"
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
        :name="`conversion_niveau_${featureId}_${modal || readonly ? 'modal' : 'default'}`"
      />
      <label class="fr-label label-inline" :for="'conversion-' + niveau.value + (modal ? '-modal' : '')">
        <ConversionLevel :level="niveau" :noIcon="true" :labelSelector="true" class="fr-mr-1w" /> {{ niveau.label }}
      </label>
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
  padding: 6px 8px;
  margin-bottom: 6px;
  background-color: #fff;
  min-width: 100%;
}

.label-inline {
  display: flex;
  flex-direction: initial !important;
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
