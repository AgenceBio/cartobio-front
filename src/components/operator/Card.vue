<template>
  <div
    class="fr-card fr-card--download"
    :class="[operatorDisabled[operator.numeroBio] ? 'disabled-tooltip' : 'fr-enlarge-link', 'operator-record']"
  >
    <div
      class="fr-card__body"
      @click="goToExploitations()"
      @mouseenter="handleMouseEnter(operator)"
      @mouseleave="hideTooltip"
    >
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <div v-if="!operatorDisabled[operator.numeroBio]" class="fr-link">
            {{ operator.nom || operator.denomationCourante }}
          </div>
          <div v-else class="nameoperator">
            {{ `${operator.nom || operator.denomationCourante}` }}
          </div>
        </h3>
        <p class="fr-card__desc">
          <span class="fr-hint-text">
            <span class="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true"></span>
            {{ operator.commune }}, {{ operator.codePostal }}
          </span>
        </p>
        <div class="fr-card__start top-bar-tooltip">
          <div class="fr-tags-group">
            <NotificationState v-if="operator.notifications" :operator="operator" :card="true" />
            <div v-if="operator.lastmixitestate">
              <p class="custom-tag">{{ engagementList[operator.lastmixitestate].label }}</p>
            </div>
          </div>
          <div>
            <button
              v-if="isEpingle"
              class="ri-pushpin-fill"
              style="color: #000091"
              @click.stop="unpin(operator.numeroBio)"
              aria-label="Désépingler l'exploitation {{ operator.nom || operator.denomationCourante }}"
            ></button>
            <button
              v-else-if="!operatorDisabled[operator.numeroBio]"
              class="ri-pushpin-line"
              style="color: #000091"
              @click.stop="pin(operator.numeroBio)"
              aria-label="Épingler l'exploitation {{ operator.nom || operator.denomationCourante }}"
            ></button>
            <span
              v-if="operatorDisabled[operator.numeroBio]"
              aria-hidden
              class="fr-ml-1w fr-icon-lock-fill fr-icon--sm"
              aria-label="Dossier inaccessible"
            ></span>
            <button
              v-else
              class="fr-ml-1w fr-icon-arrow-right-line fr-icon--sm cursor-button"
              @click.stop="goToExploitations()"
              aria-label="Voir les détails de l'exploitation {{ operator.nom || operator.denomationCourante }}"
            ></button>
            <div v-if="tooltip.operatorId == operator.id" class="tooltip-text" role="tooltip">
              Le dossier n’est pas accessible
            </div>
          </div>
        </div>
        <div class="fr-card__end">
          <div class="fr-hint-text" v-if="operator.notifications.numeroClient">
            n° client {{ operator.notifications.numeroClient }}
          </div>
          <div />
          <div class="fr-hint-text">n° Bio {{ operator.numeroBio }}</div>
        </div>
      </div>
    </div>
    <div
      class="fr-card__header"
      :class="[
        getStatus(operator) !== 'NON ENGAGEE' && getStatus(operator) !== 'ARRETEE' ? 'container' : 'container-unique',
      ]"
    >
      <div class="row" v-if="getStatus(operator) !== 'NON ENGAGEE' && getStatus(operator) !== 'ARRETEE'">
        <div class="top-bar-tooltip">
          <div>
            <span class="fr-icon-award-line fr-icon--sm lastcertified"></span>
            <span class="lastcertifieddate">{{
              operator.lastcertifieddate ? new Date(operator.lastcertifieddate).getFullYear() : "-"
            }}</span>
          </div>

          <div class="error-icon" v-if="operator.otherParcellaire">
            <span>!</span>
            <div class="tooltip" v-if="certificationState == 'CERTIFIED'">
              <span>
                Une nouvelle version a été créée après la certification <br />de {{ operator.version_name }}
              </span>
            </div>
            <div class="tooltip" v-if="certificationState == 'PENDING_CERTIFICATION'">
              <span>
                Une nouvelle version a été créée après la soumission <br />de {{ operator.version_name }} par le
                contrôleur
              </span>
              <br />
              <span>
                <span class="informations">Créee le</span> <span class="fr-icon-calendar-2-line fr-icon--sm"></span>
                {{ jjmmyyyy(operator.created_at) }} <span class="informations">Par</span>
                <div v-if="operator.metadata.source === 'API Parcellaire'">
                  <span class="fr-icon-download-line fr-icon--sm" />
                  Api Parcellaire
                </div>
                <div v-else-if="operator.metadata.source === 'telepac'">
                  <span class="fr-icon-refresh-line fr-icon--sm" />
                  Import Telépac {{ operator.metadata.campagne }}
                </div>
                <div v-else>
                  <span class="fr-icon-user-line fr-icon--sm" />{{
                    JSON.parse(operator.user).nom + " " + JSON.parse(operator.user).prenom
                  }}
                </div>
              </span>
            </div>
            <div class="tooltip" v-if="certificationState == 'AUDITED'">
              <span> Une nouvelle version a été créée après le contrôle <br />de {{ operator.version_name }} </span>
            </div>
          </div>
        </div>
      </div>
      <div class="center" v-else>
        <div v-if="getStatus(operator) === 'NON ENGAGEE'">
          L’exploitation n’est pas encore gérée par {{ organismeOc.nom || "votre OC" }}. Pour accéder au dossier sur
          CartoBio, la notification doit d’abord être validée sur le portail de notification par un chargé de
          certification.
        </div>
        <div v-if="getStatus(operator) === 'ARRETEE' && operatorDisabled[operator.numeroBio]">
          L’exploitation n’est plus gérée par {{ organismeOc.nom || "votre OC" }} et aucune version de parcellaire de
          cette exploitation ne concerne votre organisme certificateur.
        </div>
        <div v-else-if="getStatus(operator) === 'ARRETEE'">
          L’exploitation n’est plus gérée par {{ organismeOc.nom || "votre OC" }}. Vous pouvez tout de même accéder aux
          versions de parcellaire initiées par votre organisme certificateur.
        </div>
      </div>

      <div
        class="row"
        v-if="!certificationState && !operatorDisabled[operator.numeroBio] && getStatus(operator) !== 'ARRETEE'"
      >
        <button
          class="fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline"
          @click="goToExploitations"

        >
          Créer un parcellaire
        </button>
      </div>

      <div
        class="row"
        v-if="
          auditDate &&
          (certificationState == 'CERTIFIED' || certificationState === 'PENDING_CERTIFICATION') &&
          !operatorDisabled[operator.numeroBio]
        "
      >
        <p class="fr-hint-tex controlerealise" aria-live="polite">Contrôle réalisé</p>
        <div class="certification-info" aria-live="polite">
          <div class="fr-icon-calendar-2-line fr-icon--sm"></div>
          <div class="fr-hint-text">{{ jjmmyyyy(auditDate) }}</div>
        </div>
      </div>

      <div
        class="row"
        v-if="
          certificationState &&
          !operatorDisabled[operator.numeroBio] &&
          getStatus(operator) !== 'ARRETEE' &&
          showCertificationBadge
        "
      >
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

      <div v-if="certificationState == 'AUDITED' && !operatorDisabled[operator.numeroBio] && record_id">
        <button
          class="fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline"
          @click="goToSpecificVersion"
        >
          Soumettre {{ operator.version_name }}
        </button>
      </div>

      <div v-if="certificationState == 'OPERATOR_DRAFT' && !operatorDisabled[operator.numeroBio]">
        <button
          class=" fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline"
          @click="goToSpecificVersion"
        >
          Contrôler {{ operator.version_name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { jjmmyyyy } from "@/utils/dates.js";
import ParcellaireState from "@/components/records/State.vue";
import NotificationState from "@/components/records/NotificationState.vue";
import { engagementList } from "@/referentiels/ab.js";
import { pinOperator, unpinOperator } from "@/cartobio-api";

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  operatorDisabled: {
    required: true,
  },
  showCertificationBadge: {
    type: Boolean,
    default: true,
  },
  certificationState: String,
  certificationDateDebut: String,
  auditDate: String,
  record_id: String,
  organismeOc: Object,
});
const emit = defineEmits(["pin"]);

const isEpingle = ref(props.operator.epingle);
const tooltip = ref({
  visible: false,
  operatorId: null,
});

const router = useRouter();

const goToExploitations = () => {
  if (!props.operatorDisabled[props.operator.numeroBio]) {
    return router.push(`/exploitations/${props.operator.numeroBio}`);
  }
};

const goToSpecificVersion = () => {
  if (!props.record_id) {
    return;
  }
  return router.push(`/exploitations/${props.operator.numeroBio}/${props.record_id}`);
};

// tempo
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

function getStatus(operator) {
  const notif = operator.notifications ?? {};

  return notif.etatCertification;
}
// tooltip
function handleMouseEnter(operator) {
  if (props.operatorDisabled[operator.numeroBio]) {
    tooltip.value.visible = true;
    tooltip.value.operatorId = operator.id;
  }
}
function hideTooltip() {
  tooltip.value.visible = false;
  tooltip.value.operatorId = null;
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
  order: 1 !important;
}

.certification-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-icon {
  position: relative;
  width: 24px;
  height: 24px;
  background-color: #ff5655;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  font-family: Arial, sans-serif;
  margin-right: 20px;
}

.tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-95%);
  background-color: #ffebeb;
  color: #d32f2f;
  padding: 8px;
  border-radius: 5px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.error-icon:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.disabled-tooltip * {
  color: grey;
  text-decoration: none;
}

.disabled-tooltip .fr-link {
  pointer-events: none;
  text-decoration: none;
  text-decoration-thickness: 0px;
}

.tooltip-text {
  background-color: white;
  color: black;
  text-align: left;
  padding: 6px 10px;
  position: absolute;
  font-size: 14px;
  z-index: 1;
  border-top: 1px solid #dddddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transform: translateX(-90%);
}

.tooltip-text::before {
  content: "";
  position: absolute;
  bottom: 100%;
  right: 3.5px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #dddddd transparent;
  border-top: 4px solid transparent;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  bottom: 100%;
  right: 5.5px;
  border-width: 4px;
  border-style: solid;
  border-color: transparent transparent white transparent;
  border-top: 4px solid transparent;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
}

.fr-tooltip {
  background-repeat: no-repeat;
}

.top-bar-tooltip {
  display: flex;
  justify-content: space-between;
}

.cursor-button {
  color: #000091;
  cursor: pointer;
}

.lastcertified {
  background-color: #e5fbfd;
  border: 1px solid #4cb4bd;
  border-radius: 4px;
  padding: 4px;
  color : #006A6F
}

.lastcertifieddate {
  color: #006a6f;
  margin-left: 10px;
}

.controlerealise {
  margin-bottom: -20px;
}

.nameoperator {
  font-size: 1rem;
}

.container-unique {
  justify-content: center;
  align-items: center;
}

.center {
  display: inline-block;
  padding: 50px;
  font-style: italic;
  font-size: 0.75rem;
}

.fr-card {
  border-radius: 0px;
  border: 1px;
}

.custom-tag {
  margin-left: 10px;

  align-items: center;
  padding: 2px 5px;
  gap: 2px;

  margin-top: 2%;

  background: #ffffff;

  border: 1px solid #37635f;
  border-radius: 12px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;

  text-align: center;

  color: #37635f;
}

.fr-enlarge-link:hover {
  background-color: var(--background-alt-blue-france-hover) !important;
}
.fr-enlarge-link:active {
  background-color: var(--light-background-action-low-blue-france) !important;
}

.informations {
  font-weight: normal;
  color: grey;
}
</style>
