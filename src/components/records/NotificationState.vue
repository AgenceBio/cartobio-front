<template>
  <span :class="[badgeClasses.class]" :style="badgeClasses.style">
    <span :class="['icon', 'fr-icon--sm', stateInfo.icon]" aria-hidden="true"></span>
    <span v-if="text && record !== 'BROUILLON'" class="mr-1">Notification&nbsp;</span>
    <span :class="{ lowercase: text && record !== 'BROUILLON' }">{{ stateInfo.label }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";

import { notificationsStateLevel } from "@/referentiels/ab.js";

const props = defineProps({
  record: {
    type: String,
    required: true,
  },
  text: {
    type: Boolean,
    default: false,
  },
});

const badgeClasses = computed(() => {
  const baseClasses = ["component"];

  const colorClasses = {
    backgroundColor: `${stateInfo.value.color} !important`,
    color: `${stateInfo.value.textColor} !important`,
  };

  return {
    class: [...baseClasses],
    style: colorClasses,
  };
});
const stateInfo = computed(() => notificationsStateLevel[props.record]);
</script>

<style>
.component {
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.icon {
  margin-right: 4px;
}

.lowercase {
  text-transform: lowercase;
}
</style>
