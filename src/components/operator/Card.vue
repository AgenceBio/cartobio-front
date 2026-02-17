<template>
  <div
    class="fr-card fr-card--download"
    :class="[operatorDisabled[operator.numeroBio] ? 'disabled-tooltip' : 'card-activate', 'operator-record']"
  >
    <div
      class="fr-card__body"
      @click="goToExploitations(operator)"
      @mouseenter="handleMouseEnter(operator)"
      @mouseleave="hideTooltip"
    >
      <div class="fr-card__content">
        <div class="fr-card__start top-bar-tooltip">
          <div class="fr-tags-group">
            <NotificationState v-if="operator.notifications" :operator="operator" :inline="true" />
            <div
              v-if="
                operator.lastmixitestate && getStatus(operator) !== 'ARRETEE' && getStatus(operator) !== 'NON ENGAGEE'
              "
            >
              <p class="custom-tag fr-m-0">{{ engagementList[operator.lastmixitestate].label }}</p>
            </div>
          </div>
          <div class="actions-button">
            <button
              v-if="isEpingle"
              type="button"
              class="fr-m-1w ri-pushpin-fill"
              style="color: #000091"
              @click.stop="unpin(operator.numeroBio)"
              :aria-label="`Désépingler l'exploitation ${operator.nom || operator.denomationCourante}`"
              v-tooltip="{ text: 'Désépingler l\'exploitation', position: 'bottom' }"
            ></button>
            <button
              v-else-if="!operatorDisabled[operator.numeroBio]"
              type="button"
              class="fr-m-1w ri-pushpin-line"
              style="color: #000091"
              @click.stop="pin(operator.numeroBio)"
              :aria-label="`Épingler l'exploitation ${operator.nom || operator.denomationCourante}`"
              v-tooltip="{ text: 'Epingler l\'exploitation', position: 'bottom' }"
            ></button>
            <template v-if="operatorDisabled[operator.numeroBio]">
              <p class="fr-sr-only">Dossier inaccessible</p>
              <span
                class="fr-ml-1w fr-icon-lock-line fr-icon--sm"
                aria-hidden="true"
                :aria-describedby="tooltip.operatorId == operator.id ? `tooltip-disabled-${operator.id}` : undefined"
              ></span>
            </template>
            <button
              v-else
              type="button"
              class="fr-ml-1w fr-icon-arrow-right-line fr-icon--sm cursor-button"
              @click.stop="goToExploitations(operator)"
              :aria-label="`Voir les détails de l'exploitation ${operator.nom || operator.denomationCourante}`"
              v-tooltip="{ text: 'Ouvrir le dossier de l\'exploitation ', position: 'bottom' }"
            ></button>
            <p
              v-if="tooltip.operatorId == operator.id"
              :id="`tooltip-disabled-${operator.id}`"
              class="tooltip-text"
              role="tooltip"
              aria-live="polite"
            >
              Le dossier n'est pas accessible
            </p>
          </div>
        </div>
        <h3
          class="fr-card__title fr-mt-2w name-operator"
          :class="{ 'link-name-operator': !operatorDisabled[operator.numeroBio] }"
        >
          {{ operator.nom || operator.denomationCourante }}
        </h3>
        <div class="fr-card__desc fr-mt-1v fr-mb-5v">
          <p class="fr-hint-text fr-text--sm">
            <span class="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true"></span>
            {{ operator.commune }}, {{ operator.codePostal }}
          </p>
          <div class="num-client fr-mt-3w">
            <p class="fr-hint-text" v-if="operator.notifications?.numeroClient">
              n° client {{ operator.notifications.numeroClient ?? "-" }}
            </p>
            <p class="fr-hint-text fr-mt-0">n° Bio {{ operator.numeroBio }}</p>
          </div>
        </div>
      </div>
    </div>
    <div
      class="fr-card__footer fr-m-0 fr-p-0"
      :class="{
        container: getStatus(operator) !== 'NON ENGAGEE' && getStatus(operator) !== 'ARRETEE',
      }"
      @click="goToExploitations(operator)"
      @mouseenter="handleMouseEnter(operator)"
      @mouseleave="hideTooltip"
    >
      <div class="row" v-if="getStatus(operator) !== 'NON ENGAGEE' && getStatus(operator) !== 'ARRETEE'">
        <div class="top-bar-tooltip">
          <div class="lastcertifed-container">
            <span class="fr-icon-award-line fr-icon--sm lastcertified" aria-hidden="true"></span>
            <p class="lastcertifieddate fr-mb-0 fr-text--sm">{{ operator.lastcertifieddate ?? "-" }}</p>
          </div>
          <button
            v-if="operator.otherParcellaire"
            type="button"
            class="error-icon"
            :aria-describedby="`tooltip-parcellaire-${operator.numeroBio}`"
          >
            <span aria-hidden="true">!</span>
            <span class="fr-sr-only">Nouvelle version de parcellaire disponible, voir les détails</span>
            <div class="tooltip" role="tooltip" :id="`tooltip-parcellaire-${operator.numeroBio}`">
              <p v-if="certificationState == 'CERTIFIED'" class="fr-text--sm">
                Une nouvelle version a été créée après la certification <br />de {{ operator.version_name }}
              </p>
              <p v-else-if="certificationState == 'PENDING_CERTIFICATION'" class="fr-text--sm">
                Une nouvelle version a été créée après la soumission <br />de {{ operator.version_name }} par le
                contrôleur
              </p>

              <p v-else-if="certificationState == 'AUDITED'" class="fr-text--sm">
                Une nouvelle version a été créée après le contrôle <br />de {{ operator.version_name }}
              </p>
              <span class="informations-tooltip-container">
                <span class="informations-tooltip">
                  <span class="fr-icon-calendar-2-line fr-icon--sm text-black" aria-hidden="true"></span>
                  <p class="fr-mb-0 fr-text--sm fr-text--regular text-black">
                    Le {{ jjmmyyyy(operator.otherParcellaire[0].created_at) }}
                  </p> </span
                ><span class="informations-tooltip">
                  <p class="fr-mb-0 fr-text--sm fr-text--regular text-gray">Par</p>
                  <template v-if="operator.otherParcellaire[0].metadata.source === 'API Parcellaire'">
                    <span class="fr-icon-download-line fr-icon--sm text-black" aria-hidden="true"></span>
                    <p class="fr-mb-0 fr-text--sm fr-text--regular text-black">Api Parcellaire</p>
                  </template>
                  <template v-else-if="operator.otherParcellaire[0].metadata.source === 'telepac'">
                    <span class="fr-icon-refresh-line fr-icon--sm text-black" aria-hidden="true"></span>
                    <p class="fr-mb-0 fr-text--sm fr-text--regular text-black">
                      Import Telépac {{ operator.otherParcellaire[0].metadata.campagne }}
                    </p>
                  </template>
                  <template v-else>
                    <span class="fr-icon-user-line fr-icon--sm text-black" aria-hidden="true"></span>
                    <p class="fr-mb-0 fr-text--sm fr-text--regular text-black">
                      {{
                        JSON.parse(operator.otherParcellaire[0].user).nom +
                        " " +
                        JSON.parse(operator.otherParcellaire[0].user).prenom
                      }}
                    </p>
                  </template>
                </span>
              </span>
            </div>
          </button>
        </div>
      </div>
      <div class="center" v-else>
        <p v-if="getStatus(operator) === 'NON ENGAGEE'">
          L'exploitation n'est pas encore gérée par {{ organismeOc?.nom || "votre OC" }}. Pour accéder au dossier sur
          CartoBio, la notification doit d'abord être validée sur le portail de notification par un chargé de
          certification.
        </p>
        <p v-if="getStatus(operator) === 'ARRETEE' && operatorDisabled[operator.numeroBio]">
          L'exploitation n'est plus gérée par {{ organismeOc?.nom || "votre OC" }} et aucune version de parcellaire de
          cette exploitation ne concerne votre organisme certificateur.
        </p>
        <p v-else-if="getStatus(operator) === 'ARRETEE'">
          L'exploitation n'est plus gérée par {{ organismeOc?.nom || "votre OC" }}. Vous pouvez tout de même accéder aux
          versions de parcellaire initiées par votre organisme certificateur.
        </p>
      </div>

      <div
        class="row"
        v-if="!certificationState && !operatorDisabled[operator.numeroBio] && getStatus(operator) !== 'ARRETEE'"
      >
        <button
          type="button"
          class="fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline fr-pl-0 button-footer"
          @click.stop="goToExploitations(operator)"
        >
          Créer un parcellaire
        </button>
      </div>

      <div
        class="row"
        v-if="
          auditDate &&
          getStatus(operator) !== 'ARRETEE' &&
          (certificationState == 'CERTIFIED' || certificationState === 'PENDING_CERTIFICATION') &&
          !operatorDisabled[operator.numeroBio]
        "
      >
        <p class="fr-hint-text fr-text--sm fr-mb-0" aria-live="polite">Contrôle réalisé</p>
        <div class="certification-info fr-text--sm fr-mb-0 fr-mt-1v" aria-live="polite">
          <span class="fr-icon-calendar-2-line fr-icon--sm" aria-hidden="true"></span>
          <p class="fr-hint-text fr-text--sm fr-mb-0">{{ jjmmyyyy(auditDate) }}</p>
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
        <div v-if="certificationDateDebut" class="certification-info fr-mt-1v">
          <span class="fr-icon-calendar-2-line fr-icon--sm" aria-hidden="true"></span>
          <p class="fr-hint-text fr-text--sm fr-mb-0">{{ jjmmyyyy(certificationDateDebut) }}</p>
        </div>
        <div v-else-if="certificationState != 'PENDING_CERTIFICATION'" class="certification-info fr-mt-1v">
          <span class="fr-icon-calendar-2-line fr-icon--sm" aria-hidden="true"></span>
          <p class="fr-hint-text fr-text--sm fr-mb-0">{{ jjmmyyyy(operator.updated_at) }}</p>
        </div>
      </div>

      <div
        v-if="
          certificationState == 'AUDITED' &&
          !operatorDisabled[operator.numeroBio] &&
          record_id &&
          operator.notifications?.etatCertification != 'ARRETEE'
        "
      >
        <button
          type="button"
          class="fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline button-footer"
          @click.stop="goToSpecificVersion"
          :aria-label="`Consulter la version ${operator.version_name}`"
        >
          Soumettre {{ operator.version_name }}
        </button>
      </div>

      <div
        v-if="
          certificationState == 'OPERATOR_DRAFT' &&
          !operatorDisabled[operator.numeroBio] &&
          operator.notifications?.etatCertification != 'ARRETEE'
        "
      >
        <button
          type="button"
          class="fr-text--sm fr-btn fr-icon-arrow-right-up-line fr-btn--icon-right fr-btn--tertiary-no-outline button-footer"
          @click.stop="goToSpecificVersion"
          :aria-label="`Consulter la version ${operator.version_name}`"
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
import { storeToRefs } from "pinia";

import ParcellaireState from "@/components/records/State.vue";
import NotificationState from "@/components/records/NotificationState.vue";
import { engagementList } from "@/referentiels/ab.js";
import { pinOperator, unpinOperator } from "@/cartobio-api";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

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

const goToExploitations = (operator) => {
  if (!props.operatorDisabled[props.operator.numeroBio]) {
    return router.push(`/exploitations/${props.operator.numeroBio}`);
  } else if (props.operatorDisabled[operator.numeroBio] && tooltip.value.visible === false) {
    tooltip.value.visible = true;
    tooltip.value.operatorId = operator.id;
  } else if (tooltip.value.visible === true) {
    hideTooltip();
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
  if (
    user.value.organismeCertificateur &&
    operator.organismeCertificateur.id !== user.value.organismeCertificateur.id
  ) {
    return "ARRETEE";
  }
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-self: center;
  padding: 0.1rem 1.4rem;
  overflow-x: hidden;
}

.fr-card {
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

.error-icon {
  position: absolute;
  right: 1.4rem;
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
  border: none;
  padding: 0;
  cursor: pointer;
}

.error-icon:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
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
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  z-index: 9999;
}

.informations-tooltip-container {
  display: flex;
  gap: 1.5rem;
}

.informations-tooltip {
  display: flex;
  gap: 3px;
}

.error-icon:hover .tooltip {
  opacity: 1;
  visibility: visible;
  overflow: visible !important;
}

.error-icon:focus .tooltip,
.error-icon:focus-visible .tooltip,
.error-icon:active .tooltip {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 48em) {
  .tooltip {
    bottom: auto;
    top: 125%;
    left: 50%;
    transform: translateX(-90%);
    white-space: normal;
    width: 200px;
  }

  .tooltip-text {
    transform: translateX(-72%) !important;
  }

  .informations-tooltip-container {
    flex-direction: column;
    gap: 0;
  }
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
  padding: 0 4px;
  color: #006a6f;
  width: fit-content;
}

.lastcertifieddate {
  color: #006a6f;
}
.lastcertifed-container {
  display: flex;
  gap: 10px;
}
.num-client {
  display: flex;
  gap: 1.2rem;
}

.name-operator {
  font-size: 1rem;
  line-height: 1.5rem;
  padding: 0;
}

.link-name-operator {
  color: var(--text-action-high-blue-france);
}
.center {
  display: flex;
  padding: 20px;
  height: 100%;
}
.center p {
  font-style: italic;
  font-size: 0.75rem;
  align-self: center;
}

.fr-card:not(.disabled-tooltip) {
  border-radius: 0px;
  background-image:
    linear-gradient(0deg, #dee5fd, #dee5fd), linear-gradient(0deg, #dee5fd, #dee5fd),
    linear-gradient(0deg, #dee5fd, #dee5fd), linear-gradient(0deg, #dee5fd, #dee5fd) !important;
}

.fr-tags-group {
  gap: 10px;
}
.custom-tag {
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

.card-activate:hover {
  background-color: var(--blue-ecume-925-125) !important;
  cursor: pointer;
}
.card-activate:active {
  background-color: var(--blue-ecume-925-125) !important;
}
.card-activate:hover .fr-card__footer {
  background-color: var(--blue-ecume-975-75) !important;
}
.text-black {
  color: var(--text-title-grey);
}

.text-gray {
  color: var(--text-mention-grey);
}

.fr-card > .fr-card__footer {
  background-color: #f4f6fe;
}

.fr-card.disabled-tooltip > .fr-card__footer {
  background-color: rgba(0, 0, 0, 0.04);
}

@media (min-width: 48em) {
  .fr-card > .fr-card__footer {
    width: 40%;
    flex: 0 0 40%;
    aspect-ratio: auto;
  }
}

.actions-button > button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.button-footer:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>

<style>
@media (max-width: 78em) {
  .fr-card__footer .badge {
    max-width: 65%;
  }
}

@media (max-width: 62em) {
  .fr-card__footer .badge {
    max-width: 50%;
  }
}
</style>
