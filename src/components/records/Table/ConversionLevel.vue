<template>
  <span v-if="conversionLevel.value === LEVEL_UNKNOWN" class="fr-badge fr-badge--warning">
    {{ conversionLevel.shortLabel }}
  </span>
  <span
    v-else-if="conversionLevel.value === LEVEL_MAYBE_AB"
    :class="{ 'fr-badge': isOc, 'fr-badge--warning': isOc, 'fr-badge--no-icon': isOc }"
  >
    <span v-if="isOc">à préciser</span>
    <span v-else>{{ conversionLevel.shortLabel }}</span>

    <small v-if="!isOc" class="help">à préciser par l'OC</small>
  </span>
  <span v-else>
    {{ conversionLevel.shortLabel }}
    <time
      class="fr-text--xs"
      :datetime="conversionDate"
      v-if="withDate && conversionDate && isAB"
      :title="`Parcelle ${conversionLevel.shortLabel} engagée en bio le ${ddmmmmyyyy(conversionDate)}`"
    >
      {{ mmyyyy(conversionDate) }}
    </time>
  </span>
</template>

<script setup>
import { computed } from "vue";
import { LEVEL_MAYBE_AB, LEVEL_UNKNOWN, getConversionLevel, isABLevel } from "@/referentiels/ab.js";
import { mmyyyy, ddmmmmyyyy } from "@/utils/dates.js";
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
  () => props.feature.properties.engagement_date && new Date(props.feature.properties.engagement_date).toISOString()
);
const isAB = computed(() => isABLevel(props.feature.properties.conversion_niveau));
</script>

<style scoped>
time {
  color: var(--text-mention-grey);
}

.help {
  display: inline-block;
}
</style>
