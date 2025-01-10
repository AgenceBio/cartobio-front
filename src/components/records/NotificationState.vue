<template>
  <span class="component" :style="getStyle()">
    <span
      v-if="stateInfo"
      :class="['icon', 'fr-icon--sm', stateInfo != null ? stateInfo.icon : '']"
      aria-hidden="true"
    ></span>
    <span v-if="text && stateInfo && stateInfo.label !== 'Brouillon'">Notification&nbsp;</span>
    <span :class="{ lowercase: text && stateInfo && stateInfo.label !== 'Brouillon' }">{{ getLabel() }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";

import { notificationsStateLevel } from "@/referentiels/ab.js";
import { useUserStore } from "@/stores/user";

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

const { user, isOc } = useUserStore();
// const isOtherOc = ref(false);

const displayedNotif = computed(() => {
  let array = props.operator.certificats ?? props.operator.notifications;

  if (
    isOc &&
    user.organismeCertificateur &&
    array.some((n) => n.organismeCertificateurId === user.organismeCertificateur.id)
  ) {
    // L'oc connecté a des notifications le conernant on ne traite que celle-ci
    array = array.filter((n) => n.organismeCertificateurId === user.organismeCertificateur.id);
  }
  array.sort((a, b) => new Date(b.dateSignatureContrat) - new Date(a.dateSignatureContrat));

  for (const notif of array) {
    const currentStatut = notif.etatCertification || notif.status;

    if (currentStatut != "BROUILLON") {
      return notif;
    }
  }

  return null;
});

const stateInfo = computed(() => {
  if (!displayedNotif.value) {
    return notificationsStateLevel["BROUILLON"];
  }
  const currentStatut = displayedNotif.value.etatCertification || displayedNotif.value.status;

  if (
    isOc &&
    user.organismeCertificateur &&
    displayedNotif.value.organismeCertificateurId !== user.organismeCertificateur.id
  ) {
    return notificationsStateLevel["ARRETEE CHANGEMENT OC"];
  }
  return notificationsStateLevel[currentStatut];
});

function getStyle() {
  if (!stateInfo.value) {
    return {};
  }

  return {
    backgroundColor: `${stateInfo.value.color} !important`,
    color: `${stateInfo.value.textColor} !important`,
  };
}

function getLabel() {
  if (!stateInfo.value) {
    return "-";
  }

  if (
    isOc &&
    user.organismeCertificateur &&
    displayedNotif.value.organismeCertificateurId === user.organismeCertificateur.id &&
    displayedNotif.value.isUpdatedByNewOc === 1
  ) {
    return stateInfo.value.label + " - changement OC";
  }
  return stateInfo.value.label;
}
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
