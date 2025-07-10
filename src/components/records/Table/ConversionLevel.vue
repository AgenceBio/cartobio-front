<template>
  <p v-if="conversionLevel.value === LEVEL_UNKNOWN" class="badge fr-mb-0">
    {{ conversionLevel.shortLabel }}
  </p>
  <span v-else-if="conversionLevel.value === LEVEL_MAYBE_AB" class="badge badge-a-modifier">
    <template v-if="isOc">
      <span class="fr-icon" :class="getCultureIcon(culture)"></span>
      <p class="fr-mb-0">À préciser</p>
    </template>
    <template v-else>
      <p class="fr-mb-0">{{ conversionLevel.shortLabel }}</p>
      <small> à préciser par l'OC</small>
    </template>
  </span>
  <p v-else class="badge fr-mb-0" :class="`badge-${conversionLevel.value}`">
    <span class="fr-icon" :class="conversionLevel.icon"></span>
    {{ conversionLevel.shortLabel }}
    <time
      class="fr-mb-0"
      :datetime="conversionDate"
      v-if="withDate && conversionDate && isAB"
      :title="`Parcelle ${conversionLevel.shortLabel} engagée en bio le ${ddmmmmyyyy(conversionDate)}`"
    >
      {{ dateFormat(conversionDate) }}
    </time>
  </p>
</template>

<script setup>
import { computed } from "vue";
import { LEVEL_MAYBE_AB, LEVEL_UNKNOWN, getConversionLevel, isABLevel } from "@/referentiels/ab.js";
import { dateFormat, ddmmmmyyyy } from "@/utils/dates.js";
import { storeToRefs } from "pinia";
import { usePermissions } from "@/stores/permissions.js";
import { getCultureIcon } from "@/utils/features";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
  withDate: {
    type: Boolean,
    default: false,
  },
});
const { isOc } = storeToRefs(usePermissions());

const conversionLevel = computed(() => getConversionLevel(props.feature.properties.conversion_niveau));
const conversionDate = computed(
  () => props.feature.properties.engagement_date && new Date(props.feature.properties.engagement_date).toISOString(),
);
const isAB = computed(() => isABLevel(props.feature.properties.conversion_niveau));
const culture = computed(() =>
  props.feature.properties && props.feature.properties.culture && props.feature.properties.culture.length > 0
    ? props.feature.properties.culture[0].CPF
    : null,
);
</script>

<style scoped>
time {
  border-left: 1px solid;
  padding-left: 5px;
  line-height: 16px;
}
.badge {
  padding: 4px 12px;
  display: flex;
  gap: 5px;
  border-radius: 16px;
  border: 1px solid;
  align-items: center;
}

.badge-a-modifier {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border: 1px solid var(--red-marianne-925-125);
}
.badge-CONV {
  color: var(--green-tilleul-verveine-sun-418-moon-817);
  background-color: var(--green-tilleul-verveine-925-125);
  border: 1px solid var(--green-tilleul-verveine-850-200);
}
.badge-C1 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-975-75);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-C2 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-950-100);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-C3 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-925-125);
  border: 1px solid var(--green-bourgeon-850-200);
}
.badge-AB {
  color: white;
  background-color: var(--green-bourgeon-sun-425-moon-759);
  border: 1px solid var(--green-bourgeon-sun-425-moon-759);
}
</style>
