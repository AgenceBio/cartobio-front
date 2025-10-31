<template>
  <span
    :class="[computedClass, 'badge']"
    :aria-label="dateLabel ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label"
  >
    <span v-if="stateInfo.icon" :class="[stateInfo.icon, 'fr-icon--sm']" aria-hidden="true" />
    <p class="fr-mb-0" :class="{ 'padding-left': !stateInfo.icon }">{{ stateInfo.label }}</p>
    <p v-if="showDate && dateLabel" class="fr-mb-0 year">{{ dateLabel }}</p>
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
  background: #e9edfe;
  border-radius: 4px;
  width: fit-content;
  padding: 2px 3px;
  border: 1px solid #bfccfb;
  color: #2f4077;
}

.class-audited {
  background: #fee7fc;
  border-radius: 4px;
  width: fit-content;
  padding: 2px 3px;
  border: 1px solid #fbaff5;
  color: #a558a0;
}

.class-pc {
  background: #fef3fd;
  border-radius: 4px;
  width: fit-content;
  padding: 2px 3px;
  border: 1px solid #fbaff5;
  color: #a558a0;
}

.class-c {
  background: #e5fbfd;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid #4cb4bd;
  padding: 2px 3px;
  color: #006a6f;
}

.badge.class-pp > p {
  font-style: italic;
  font-weight: 400;
  text-align: center;
  border: 1px solid #e5e5e5;
  width: fit-content;
  padding: 2px 3px;
  color: #666666;
}

.badge {
  padding-right: 1ch;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  max-width: 100%;
  height: fit-content;
}

.badge > .padding-left {
  padding-left: 1ch;
}

.badge > p {
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
