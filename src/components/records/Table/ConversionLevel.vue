<template>
  <div class="flex">
    <span
      v-if="conversionLevel.value === LEVEL_MAYBE_AB || conversionLevel.value === LEVEL_UNKNOWN"
      class="badge badge-a-modifier"
    >
      <template v-if="isOc">
        <span class="fr-icon fr-icon-pencil-line fr-icon--sm"></span>
        <p class="fr-mb-0 small-text">Certification</p>
      </template>
      <template v-else>
        <p class="fr-mb-0 small-text">{{ conversionLevel.shortLabel }}</p>
        <p class="small-text">par l'OC</p>
      </template>
    </span>
    <div v-else class="badge fr-mb-0" :class="`badge-${conversionLevel.value}`">
      <span v-if="!noIcon" class="fr-icon" :class="conversionLevel.icon"></span>
      <div v-if="!labelSelector">
        {{ conversionLevel.shortLabel }}
      </div>
      <div v-else>
        {{ conversionLevel.labelSelector ?? conversionLevel.shortLabel }}
      </div>
      <time
        class="fr-mb-0"
        :datetime="conversionDate"
        v-if="withDate && conversionDate && isAB"
        :title="`Parcelle ${conversionLevel.shortLabel} engagée en bio le ${ddmmmmyyyy(conversionDate)}`"
      >
        {{ dateFormat(conversionDate) }}
      </time>
    </div>
    <div
      v-if="withDate && !conversionDate && ['C1', 'C2', 'C3'].includes(conversionLevel.value)"
      class="conversion-missing-date fr-text--sm"
    >
      <span class="fr-icon fr-icon-calendar-line fr-icon--sm"></span>
      <span class="conversion-text">Conversion</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { LEVEL_MAYBE_AB, LEVEL_UNKNOWN, getConversionLevel, isABLevel } from "@/referentiels/ab.js";
import { dateFormat, ddmmmmyyyy } from "@/utils/dates.js";
import { storeToRefs } from "pinia";
import { usePermissions } from "@/stores/permissions.js";

const props = defineProps({
  feature: {
    type: Object,
    required: false,
  },
  withDate: {
    type: Boolean,
    default: false,
  },
  level: {
    type: Object,
    required: false,
  },
  noIcon: {
    type: Boolean,
    default: false,
  },
  labelSelector: {
    type: Boolean,
    default: false,
  },
});
const { isOc } = storeToRefs(usePermissions());

const conversionLevel = computed(() => {
  return props.level ? props.level : getConversionLevel(props.feature.properties.conversion_niveau);
});
const conversionDate = computed(
  () =>
    props.withDate &&
    props.feature.properties.engagement_date &&
    new Date(props.feature.properties.engagement_date).toISOString(),
);
const isAB = computed(() => props.feature && isABLevel(props.feature.properties.conversion_niveau));
</script>

<style scoped>
.flex {
  display: flex;
  align-items: center;
  gap: 8px;
}

time {
  border-left: 1px solid;
  padding-left: 5px;
  line-height: 16px;
}

.badge {
  padding: 2px 8px;
  display: flex;
  gap: 5px;
  border-radius: 16px;
  align-items: center;
  font-size: 12px;
}

.small-text {
  font-size: 12px;
}

.badge-unknown {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
}

.badge-a-modifier {
  color: var(--warning-425-625);
  background-color: var(--warning-950-100);
}

.badge-a-modifier:hover {
  background-color: var(--red-marianne-925-125-hover);
}

.badge-CONV {
  color: var(--green-tilleul-verveine-sun-418-moon-817);
  background-color: var(--green-tilleul-verveine-925-125);
}

.badge-C1 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-975-75);
}

.badge-C2 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-950-100);
}

.badge-C3 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-925-125);
}

.badge-AB {
  color: white;
  background-color: var(--green-bourgeon-sun-425-moon-759);
}

.conversion-missing-date {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  margin-bottom: auto;
  color: var(--text-default-error);
}
</style>
