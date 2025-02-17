<template>
  <div class="fr-card fr-card--download">
    <div class="fr-card__body" style="order: 1 !important">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <router-link
            v-if="!operatorDisabled[operator.numeroBio]"
            :to="`/exploitations/${operator.numeroBio}`"
            class="fr-link"
          >
            {{ operator.nom }}
          </router-link>
        </h3>
        <p class="fr-card__desc">
          <span class="fr-hint-text">
            <span class="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true"></span>
            {{ operator.commune }}, {{ operator.codePostal }}
          </span>
        </p>
        <div class="fr-card__start" style="display: flex; justify-content: space-between">
          <div class="fr-tags-group">
            <NotificationState v-if="operator.certificats || operator.notifications" :operator="operator" />
          </div>
          <div>
            <button
              v-if="isEpingle"
              class="ri-pushpin-fill"
              style="color: #000091"
              @click="unpin(operator.numeroBio)"
            ></button>
            <button v-else class="ri-pushpin-line" style="color: #000091" @click="pin(operator.numeroBio)"></button>
            <span
              v-if="operatorDisabled[operator.numeroBio]"
              aria-hidden
              class="fr-ml-1w fr-icon-lock-fill fr-icon--sm"
            ></span>
            <span v-else class="fr-ml-1w fr-icon-arrow-right-line fr-icon--sm" style="color: #000091"></span>
          </div>
        </div>
        <div class="fr-card__end">
          <div class="fr-hint-text">n° client {{ clientNumber }}</div>
          <div />
          <div class="fr-hint-text">n° Bio {{ operator.numeroBio }}</div>
        </div>
      </div>
    </div>

    <div class="fr-card__header container">
      <div class="row">
        <div>
          <span
            class="fr-icon-award-line fr-icon--sm"
            style="background-color: #e5fbfd; border: 1px solid #4cb4bd; border-radius: 4px; padding: 4px"
          ></span>
          <span style="color: #006a6f; margin-left: 10px">-</span>
        </div>
      </div>

      <div class="row" v-if="!certificationState">
        <button class="fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline">
          Créer un parcellaire
        </button>
      </div>

      <div
        class="row"
        v-if="auditDate && (certificationState == 'CERTIFIED' || certificationState === 'PENDING_CERTIFICATION')"
      >
        <p class="fr-hint-text" style="margin-bottom: -20px">Contrôle réalisé</p>
        <div class="certification-info">
          <div class="fr-icon-calendar-2-line fr-icon--sm"></div>
          <div class="fr-hint-text">{{ jjmmyyyy(auditDate) }}</div>
        </div>
      </div>

      <div class="row" v-if="certificationState">
        <ParcellaireState
          :record="{
            certification_date_debut: certificationDateDebut,
            certification_state: certificationState,
            audit_date: auditDate,
          }"
          :show-date="false"
        />
        <div v-if="certificationDateDebut" class="certification-info">
          <span class="fr-icon-calendar-2-line fr-icon--sm"></span>
          <span class="fr-hint-text">{{ jjmmyyyy(certificationDateDebut) }}</span>
        </div>
        <div v-else-if="certificationState != 'PENDING_CERTIFICATION'" class="certification-info">
          <span class="fr-icon-calendar-2-line fr-icon--sm"></span>
          <span class="fr-hint-text">{{ jjmmyyyy(operator.updated_at) }}</span>
        </div>
      </div>

      <div class="row" v-if="certificationState == 'AUDITED'">
        <button class="fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline">
          Soumettre [Nom de version]
          <!-- TODO: Ici nom de version à retourner -->
        </button>
      </div>

      <div class="row" v-if="certificationState == 'OPERATOR_DRAFT'">
        <button class="fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline">
          Contrôler [Nom de version]
          <!-- TODO: Ici nom de version à retourner -->
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { dateFormat, jjmmyyyy } from "@/utils/dates.js";
import ParcellaireState from "@/components/records/State.vue";
import NotificationState from "@/components/records/NotificationState.vue";
import { pinOperator, unpinOperator } from "@/cartobio-api";

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  operatorDisabled: {
    required: true,
  },
  certificationState: String,
  certificationDateDebut: String,
  auditDate: String,
});

const emit = defineEmits(["pin"]);

const isEpingle = ref(props.operator.epingle);

// tempo
const clientNumber = computed(() => Math.floor(Math.random() * 10000));
function pin(numeroBio) {
  pinOperator(numeroBio).then(() => {
    isEpingle.value = true;
    emit("pin", true);
  });
}

function unpin(numeroBio) {
  unpinOperator(numeroBio).then(() => {
    isEpingle.value = false;
    emit("pin", false);
  });
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.date-block {
  margin: 15px 0;
}

.container {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
}
.row {
  display: inline-grid;
  align-items: center;
  width: 100%;
  padding-left: 20px;
  flex-wrap: wrap;
}

.fr-card__end {
  display: flex;
  flex-direction: row;
  justify-content: flex-start !important;
  align-items: center;
  gap: 10px;
}

.fr-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.fr-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.certification-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
