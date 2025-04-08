<template>
  <div :class="{ 'margin-top': isEnAttente() }">
    <div :class="{ 'badge-inline': props.inline }">
      <span class="component" :style="getStyle()">
        <span v-if="stateInfo" :class="stateInfo.icon ? stateInfo.icon : ''" aria-hidden="true"></span>
        <p v-if="text && stateInfo && stateInfo.label !== 'Brouillon'" class="fr-mb-0 fr-text--xs">Notification</p>
        <p class="fr-mb-0 fr-text--xs" :class="{ lowercase: text && stateInfo && stateInfo.label !== 'Brouillon' }">
          {{ stateInfo ? stateInfo.label : "-" }}
        </p>
      </span>
      <p v-if="isEnAttente() && props.inline" class="fr-hint-text oc-change inline-text fr-mb-0">
        En attente de validation OC
      </p>
      <p v-if="isChangementOc && props.inline" class="fr-hint-text oc-change inline-text fr-mb-0">Changement d'OC</p>
    </div>
    <p v-if="isEnAttente() && !props.inline" class="fr-hint-text oc-change text-center fr-mb-0">
      En attente de validation OC
    </p>
    <p v-if="isChangementOc && !props.inline" class="fr-hint-text oc-change text-center fr-mb-0">Changement d'OC</p>
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
  inline: {
    type: Boolean,
    default: false,
  },
});

const userStore = useUserStore();
const { user, isOc } = storeToRefs(userStore);
const isChangementOc = ref(false);
const displayedNotif = ref(null);
const stateInfo = ref(null);

onMounted(() => {
  if (props.operator) {
    displayedNotif.value = props.operator.notifications;
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
      isChangementOc.value = true;
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
  if (props.stateInfoProps) return false;
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
  gap: 4px;
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

.badge-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-text {
  margin-left: 8px;
}
</style>
