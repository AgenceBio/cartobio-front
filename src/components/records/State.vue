<template>
  <span
    :class="[computedClass, 'badge']"
    :aria-label="dateLabel ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label"
  >
    <span :class="[stateInfo.icon, stateInfo.icon ? 'fr-icon--sm fr-mr-1v' : '']" />
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
const dateLabel = computed(() => (props.showDate ? yearLabel(props.record) : null));

const computedClass = computed(() => {
  switch (stateId.value) {
    case CertificationState.OPERATOR_DRAFT:
      return "class-op";
    case CertificationState.AUDITED:
      return "class-audited";
    case CertificationState.PENDING_CERTIFICATION:
      return "class-pc";
    case CertificationState.CERTIFIED:
      return "class-c";
    default:
      return "class-pp";
  }
});
</script>

<style scoped>
.year::before {
  content: "|";
  opacity: 0.3;
  padding: 0 0.3rem;
}

.class-op {
  width: auto;
  background: #e9edfe;
  border-radius: 4px;
  width: fit-content;

  font-family: "Marianne";
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  padding: 2px;
  border: 1px solid #2f4077;

  color: #2f4077;
}

.class-audited {
  background: #fee7fc;
  border-radius: 4px;

  font-family: "Marianne";
  width: fit-content;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  padding: 2px;
  border: 1px solid #a558a0;
  color: #a558a0;
}

.class-pc {
  background: #fef3fd;
  border-radius: 4px;
  width: fit-content;

  font-family: "Marianne";
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  padding: 2px;
  border: 1px solid #a558a0;

  color: #a558a0;
}

.class-c {
  background: #e5fbfd;
  border-radius: 4px;
  width: fit-content;

  font-family: "Marianne";
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;

  text-transform: uppercase;
  border: 1px solid #006a6f;
  padding: 2px;

  color: #006a6f;
}

.class-pp {
  font-family: "Marianne";
  font-style: italic;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  border: 1px solid #666666;
  padding: 2px;
  width: fit-content;
  padding: 5px;

  color: #666666;
}
</style>
