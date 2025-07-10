<template>
  <p v-if="conversionLevel.value === LEVEL_UNKNOWN" class="badge fr-mb-0">
    {{ conversionLevel.shortLabel }}
  </p>
  <span v-else-if="conversionLevel.value === LEVEL_MAYBE_AB" class="badge badge-a-modifier">
    <template v-if="isOc">
      <span class="fr-icon fr-icon-edit-line fr-icon--sm"></span>
      <p class="fr-mb-0">À préciser</p>
    </template>
    <template v-else>
      <p class="fr-mb-0">{{ conversionLevel.shortLabel }}</p>
      <small> à préciser par l'OC</small>
    </template>
  </span>
  <p v-else class="badge fr-mb-0" :class="`badge-${conversionLevel.shortLabel}`">
    <span class="fr-icon fr-icon--sm" :class="conversionLevel.icon"></span>
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
</script>

<style scoped>
time {
  border-left: 1px solid;
  padding-left: 5px;
}
.badge {
  padding: 7px 12px;
  display: flex;
  gap: 5px;
  border-radius: 16px;
  border: 1px solid;
  line-height: 1rem;
}
</style>
