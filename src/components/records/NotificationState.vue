<template>
  <span :class="badgeClasses.class" :style="badgeClasses.style">
    <span
      v-if="stateInfo"
      :class="['icon', 'fr-icon--sm', stateInfo != null ? stateInfo.icon : '']"
      aria-hidden="true"
    ></span>
    <span v-if="text && stateInfo && stateInfo.label !== 'Brouillon'">Notification&nbsp;</span>
    <span :class="{ lowercase: text && stateInfo && stateInfo.label !== 'Brouillon' }">{{
      stateInfo ? stateInfo.label : "-"
    }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";

import { notificationsStateLevel } from "@/referentiels/ab.js";

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  text: {
    type: Boolean,
    default: false,
  },
});

const stateInfo = computed(() => {
  const array = props.operator.certificats ?? props.operator.notifications;

  array.sort((a, b) => new Date(b.dateDemarrage) - new Date(a.dateDemarrage));

  for (const notif of array) {
    const currentStatut = notif.etatCertification || notif.status;

    if (currentStatut != "BROUILLON") {
      return notificationsStateLevel[currentStatut];
    }
  }

  return notificationsStateLevel["BROUILLON"];
});

const badgeClasses = computed(() => {
  const baseClasses = ["component"];
  let colorClasses;
  if (stateInfo.value != null) {
    colorClasses = {
      backgroundColor: `${stateInfo.value.color} !important`,
      color: `${stateInfo.value.textColor} !important`,
    };
  }

  return {
    class: [baseClasses],
    style: colorClasses,
  };
});
</script>

<style>
.component {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 400;
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
