<template>
  <div :class="{ 'margin-top': isEnAttente() }">
    <span class="component" :style="getStyle()">
      <span v-if="stateInfo" :class="['icon', 'fr-icon--sm', stateInfo.icon]" aria-hidden="true"></span>
      <span v-if="text && stateInfo && stateInfo.label !== 'Brouillon'">Notification&nbsp;</span>
      <span :class="{ lowercase: text && stateInfo && stateInfo.label !== 'Brouillon' }">{{
        stateInfo ? stateInfo.label : "-"
      }}</span>
    </span>
    <div v-if="isEnAttente()" class="fr-hint-text oc-change text-center">En attente de validation OC</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { notificationsStateLevel } from "@/referentiels/ab.js";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  operator: {
    type: Object,
    required: false,
  },
  text: {
    type: Boolean,
    default: false,
  },
  stateInfoProps: {
    type: Object,
    required: false,
  },
});

const userStore = useUserStore();
const { user, isOc } = storeToRefs(userStore);
const displayedNotif = ref(null);
const stateInfo = ref(null);

onMounted(() => {
  if (props.operator) {
    const array = props.operator.certificats ?? props.operator.notifications ?? [];

    displayedNotif.value = array

    if (!displayedNotif.value) {
      stateInfo.value = notificationsStateLevel["BROUILLON"];

      return;
    }
    const currentStatut = displayedNotif.value.etatCertification || displayedNotif.value.status;

    if (
      isOc.value &&
      user.value.organismeCertificateur &&
      displayedNotif.value.organismeCertificateurId !== user.value.organismeCertificateur.id
    ) {
      stateInfo.value = notificationsStateLevel["ARRETEE"];
      return;
    }
    stateInfo.value = notificationsStateLevel[currentStatut];
  } else if (props.stateInfoProps) {
    stateInfo.value = props.stateInfoProps;
  }
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

function isEnAttente() {
  if(props.stateInfoProps) return false
  return stateInfo.value?.label === notificationsStateLevel["NON ENGAGEE"].label;
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

.margin-top {
  margin-top: 0.2rem;
}

.oc-change {
  margin-left: 11px;
}
</style>
