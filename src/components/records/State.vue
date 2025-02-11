<template>
  <span
    :class="['fr-badge', stateInfo.color]"
    :aria-label="dateLabel ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label"
  >
    <span aria-hidden>{{ stateInfo.label }}</span>
    <span v-if="showDate && dateLabel" class="year" aria-hidden>{{ dateLabel }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";

import { certificationStatesLabels, yearLabel } from "@/referentiels/ab.js";
import { CertificationState } from "@agencebio/cartobio-types";

const props = defineProps({
  record: Object,
  showDate: {
    type: Boolean,
    default: true,
  },
  certification_state: String,
});

const stateId = computed(() => {
  if (props.record) {
    return props.record.certification_state in certificationStatesLabels
      ? props.record.certification_state
      : CertificationState.UNKNOWN;
  } else if (props.certification_state) {
    return props.certification_state in certificationStatesLabels
      ? props.certification_state
      : CertificationState.UNKNOWN;
  }
  return CertificationState.UNKNOWN;
});
const stateInfo = computed(() => certificationStatesLabels[stateId.value]);
const dateLabel = computed(() => props.showDate ? yearLabel(props.record): null);
</script>

<style scoped>
.fr-badge {
  white-space: nowrap;
}
.year::before {
  content: "|";
  opacity: 0.3;
  padding: 0 0.3rem;
}
</style>
