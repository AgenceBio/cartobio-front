<template>
  <div class="filter fr-mb-2w charge-certification">
    <div @focusout="handleFocusOut($event, () => (departementShown = false))">
      <button
        title="Afficher la liste des départements"
        class="fr-btn fr-btn--secondary fr-icon fr-icon-edit-line fr-btn--icon-right"
        :aria-expanded="departementShown"
        aria-controls="departement-menu"
        @click="departementShown = !departementShown"
      >
        Départements
      </button>
      <div class="fr-menu" ref="departementSelect" id="departement-menu">
        <div class="fr-menu__list" :class="{ 'fr-hidden': !departementShown }">
          <DepartementFilter
            v-if="userDepartements != undefined"
            v-model="selectedDepartements"
            :initial-value="userDepartements"
            @update:modelValue="persistDepartements()"
          />
        </div>
      </div>
    </div>
    <div class="flex">
      <legend class="fr-hidden fr-unhidden-md">Année de référence</legend>
      <div v-for="(element, index) in lastTwoYears" :key="element">
        <div class="fr-radio-group">
          <input
            type="radio"
            :id="'annee-reference-' + index"
            name="annee-reference"
            :value="element"
            v-model="annneeReference"
            :disabled="isSearching"
          />
          <label class="fr-label" :for="'annee-reference-' + index">{{ element }}</label>
        </div>
      </div>
    </div>
    <Spinner v-if="!isLoading && isSearching" />
  </div>
  <div v-if="selectedDepartements.length > 0" class="departements-tag fr-mb-2w">
    <button
      v-for="value in selectedDepartements"
      :key="value.code"
      class="fr-tag fr-tag--sm fr-tag--dismiss"
      @click="removeDepartment(value.code)"
      :aria-label="`Supprimer '${value.nom}' des filtres de recherche`"
    >
      {{ `${value.nom} (${value.code})` }}
    </button>
  </div>
  <div v-if="isLoading">
    <Spinner>Chargement des données…</Spinner>
  </div>
  <div v-else class="callout-container fr-mb-3w">
    <button
      class="fr-callout certifiees fr-mb-0 callout-children"
      @click="goToCertifiees"
      aria-label="Accéder à la liste des opérateurs certifiés"
      v-tooltip="{ text: 'Ouvrir la liste des exploitations certifiées', position: 'bottom' }"
    >
      <div class="callout-mask"></div>
      <div class="callout-content">
        <div>
          <div class="fr-hidden-md flex">
            <span class="fr-icon fr-icon-award-line fr-icon--sm" aria-hidden="true"></span>
            <p class="fr-callout__text fr-text--xs fr-text--bold">Exploitations certifiées</p>
          </div>
          <span class="fr-h2 fr-callout__title">{{ isSearching ? "-" : summary.countCertifiees }}</span>
          <p class="fr-callout__text fr-hidden fr-unhidden-md">Exploitations certifiées</p>
        </div>
        <img
          src="@gouvfr/dsfr/artwork/pictograms/system/success.svg"
          class="fr-hidden fr-unhidden-md"
          role="illustration"
          alt=""
          height="48px"
        />
      </div>
    </button>
    <button
      class="fr-callout en-attentes fr-mb-0 callout-children"
      @click="goToEnAttentes"
      aria-label="Accéder à la liste des opérateurs contrôlés mais non certifiés"
      v-tooltip="{ text: 'Ouvrir la liste des exploitations contrôlées non certifiées', position: 'bottom' }"
    >
      <div class="callout-mask"></div>
      <div class="callout-content">
        <div>
          <div class="fr-hidden-md flex">
            <span class="fr-icon fr-icon-refresh-line fr-icon--sm" aria-hidden="true"></span>
            <p class="fr-callout__text fr-text--xs fr-text--bold">Contrôlées non certifiées</p>
          </div>
          <span class="fr-h2 fr-callout__title">{{ isSearching ? "-" : summary.countEnAttentes }}</span>
          <p class="fr-callout__text fr-hidden fr-unhidden-md">Contrôlées non certifiées</p>
        </div>
        <img
          src="../../assets/dsfr/document/conclusion.svg"
          class="fr-hidden fr-unhidden-md"
          role="illustration"
          alt=""
          height="48px"
        />
      </div>
    </button>
    <div class="callout-children">
      <button
        class="fr-callout non-auditees fr-mb-0 full-width"
        @click="goToNonAuditees"
        aria-label="Accéder à la liste des opérateurs non audités"
        v-tooltip="{ text: 'Ouvrir la liste des exploitations non certifiées', position: 'bottom' }"
      >
        <div class="callout-mask"></div>
        <div class="callout-content">
          <div>
            <div class="fr-hidden-md flex">
              <span class="fr-icon fr-icon-warning-line fr-icon--sm" aria-hidden="true"></span>
              <p class="fr-callout__text fr-text--xs fr-text--bold">Non contrôlées *</p>
            </div>
            <span class="fr-h2 fr-callout__title">{{ isSearching ? "-" : summary.countNonAuditees }}</span>
            <p class="fr-callout__text fr-hidden fr-unhidden-md">Non contrôlées *</p>
          </div>
          <img
            src="@gouvfr/dsfr/artwork/pictograms/system/warning.svg"
            class="fr-hidden fr-unhidden-md"
            role="illustration"
            alt=""
            height="48px"
          />
        </div>
      </button>
      <p class="fr-hint-text fr-mt-1w fr-hidden fr-unhidden-md align-right">
        * hors exploitations engagées en {{ annneeReference + 1 }}
      </p>
    </div>
    <p class="fr-hint-text fr-hidden-md fr-p-1w fr-mb-0 mobile-hint">
      * hors exploitations engagées en {{ annneeReference + 1 }}
    </p>
  </div>
  <div class="header-a-certifier fr-pt-4w fr-mb-3w">
    <div class="titre-a-certifier">
      <h3 class="fr-h3 fr-mb-0">Parcellaire{{ operators.length > 1 ? "s" : "" }} à certifier</h3>
      <p class="fr-text--lead fr-mb-0">({{ countToCertify }})</p>
      <Spinner v-if="!isLoadingOperator && isSearching" />
    </div>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-btn--sm fr-icon-arrow-right-line green-link"
      @click="goToACertifier"
      aria-label="Accéder à la liste des opérateurs à certifier"
      v-tooltip="{ text: 'Afficher tous les parcellaires à certifier', position: 'top' }"
    >
      Voir tout
    </button>
  </div>
  <div v-if="isLoadingOperator">
    <Spinner>Chargement des données…</Spinner>
  </div>
  <div class="a-certifier" :class="{ unique: operators.length === 1 }">
    <div
      v-for="{ record_id, audit_date, certification_date_debut, certification_state, ...operator } in operators"
      :key="operator.numeroBio"
      class="operator-record"
    >
      <OperatorCard
        :operator="operator"
        :operatorDisabled="{}"
        :certificationState="certification_state"
        :certificationDateDebut="certification_date_debut"
        :auditDate="audit_date"
        :record_id="record_id"
        :organismeOc="user.organismeCertificateur"
        @pin="loadOperators()"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { getDashboardSummary, searchOperators } from "@/cartobio-api";
import DepartementFilter from "../operator/DepartementFilter.vue";
import { onClickOutside } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import OperatorCard from "@/components/operator/Card.vue";

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(true);
const isLoadingOperator = ref(true);
const isSearching = ref(true);
const summary = ref({});
const departementShown = ref(false);
const selectedDepartements = ref([]);
const departementSelect = ref(null);
const userDepartements = ref([]);
const countToCertify = ref(0);
const operators = ref([]);

const { user } = userStore;

const lastTwoYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1];
});
const annneeReference = ref(lastTwoYears.value[0]);

onMounted(async () => {
  userDepartements.value = await userStore.getDepartements();
  if (userDepartements.value.length === 0) {
    loadSummary();
    loadOperators();
  }
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

function handleKeyDown(event) {
  if (event.key === "Escape") {
    departementShown.value = false;
  }
}

function handleFocusOut(event, closeFn) {
  const container = event.currentTarget;
  if (!container.contains(event.relatedTarget)) {
    closeFn();
  }
}

async function loadOperators() {
  const res = await searchOperators({
    input: "",
    page: 1,
    limit: 10,
    filter: {
      statutParcellaire: ["PENDING_CERTIFICATION"],
      departement: selectedDepartements.value.map((m) => m.code),
      engagement: [],
      etatNotification: ["ENGAGEE", "ENGAGGEE FUTUR"],
      pinned: false,
      etatCertification: "ALL",
    },
  });

  countToCertify.value = res.pagination.total;
  operators.value = res.records;
  isLoadingOperator.value = false;
}

watch([selectedDepartements, annneeReference], () => {
  loadSummary();
  loadOperators();
});
async function loadSummary() {
  isSearching.value = true;
  summary.value = await getDashboardSummary(
    selectedDepartements.value.map((dep) => dep.code),
    annneeReference.value,
  );

  isSearching.value = false;
  isLoading.value = false;
}

function persistDepartements() {
  const departementsToSave = selectedDepartements.value.map((dep) => dep.code);

  if (
    (userDepartements.value != null && departementsToSave.length != userDepartements.value) ||
    departementsToSave.some((s) => !userDepartements.value || !userDepartements.value.include(s))
  ) {
    userStore.saveDepartements(departementsToSave);
  }
}

onClickOutside(departementSelect, ({ target }) => {
  if (!target.classList.contains("fr-menu")) {
    departementShown.value = false;
  }
});

const removeDepartment = (code) => {
  selectedDepartements.value = selectedDepartements.value.filter((dep) => dep.code != code);
  userStore.saveDepartements(selectedDepartements.value.map((d) => d.code));
};

const goToCertifiees = () => {
  return router.push({
    path: "/certification/exploitations",
    query: {
      etatCertification: "CERTIFIED",
      etatNotification: ["ENGAGEE", "ENGAGEE FUTUR"],
      departement: selectedDepartements.value.map((d) => d.code),
      anneeReferenceCertification: annneeReference.value,
    },
  });
};
const goToEnAttentes = () => {
  return router.push({
    path: "/certification/exploitations",
    query: {
      etatCertification: "NO_CERTIFIED",
      statutParcellaire: ["AUDITED", "PENDING_CERTIFICATION"],
      etatNotification: ["ENGAGEE", "ENGAGEE FUTUR"],
      departement: selectedDepartements.value.map((d) => d.code),
      anneeReferenceCertification: annneeReference.value,
    },
  });
};
const goToNonAuditees = () => {
  return router.push({
    path: "/certification/exploitations",
    query: {
      etatCertification: "NO_CERTIFIED",
      statutParcellaire: ["OPERATOR_DRAFT", "NONE"],
      etatNotification: ["ENGAGEE", "ENGAGEE FUTUR"],
      departement: selectedDepartements.value.map((d) => d.code),
      anneeReferenceCertification: annneeReference.value,
    },
  });
};
const goToACertifier = () => {
  return router.push({
    path: "/certification/exploitations",
    query: {
      etatCertification: "ALL",
      statutParcellaire: ["PENDING_CERTIFICATION"],
      etatNotification: ["ENGAGEE", "ENGAGEE FUTUR"],
      departement: selectedDepartements.value.map((d) => d.code),
      anneeReferenceCertification: annneeReference.value,
    },
  });
};
</script>

<style scoped>
.fr-menu {
  top: auto;
}

.filter {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.flex {
  display: flex;
  gap: 0.5rem;
}

.callout-content {
  display: flex;
  align-items: end;
  justify-content: space-between;
  text-align: left;
  position: relative;
  z-index: 2;
}

.departements-tag {
  gap: 0.2rem;
  display: flex;
  flex-wrap: wrap;
}

.callout-container {
  display: flex;
  justify-content: space-between;
  gap: 1.5em;
  align-items: flex-start;
}

.full-width {
  width: 100%;
}

.callout-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0 0 56px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.fr-callout {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.fr-callout:hover {
  transform: translateY(-2px);
}

.fr-callout.certifiees:hover .callout-mask {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.08);
}

.fr-callout.en-attentes:hover .callout-mask {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.fr-callout.non-auditees:hover .callout-mask {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.08);
}

@media (min-width: 48em) {
  .callout-container .callout-children {
    width: 33%;
  }
  .callout-container .fr-callout {
    padding: 1.5rem 3rem 1.5rem 2rem;
  }
}
.callout-container .fr-callout__text {
  font-size: 0.9rem;
  line-height: 1.4rem;
}

.fr-callout.certifiees {
  background-image: linear-gradient(0deg, #5bb5a7, #5bb5a7);
  color: #5bb5a7;
  background-color: #dffdf7;
  border-radius: 0 0 56px;
}

.fr-callout.certifiees .fr-h2 {
  color: #37635f;
}

.fr-callout .fr-icon {
  padding: 0 0.2rem;
  border-radius: 4px;
}

.fr-callout.certifiees .fr-icon {
  color: #dffdf7;
  background-color: #4f9d91;
}

.fr-callout.en-attentes .fr-icon {
  color: #e5fbfd;
  background-color: #419ca4;
}

.fr-callout.non-auditees .fr-icon {
  color: #fef3fd;
  background-color: #f767ef;
}

.callout-content .flex {
  align-items: center;
}

.fr-callout.en-attentes {
  background-image: linear-gradient(0deg, #4cb4bd, #4cb4bd);
  color: #4cb4bd;
  background-color: #e5fbfd;
  border-radius: 0 0 56px;
}
.fr-callout.en-attentes .fr-h2 {
  color: #006a6f;
}
.fr-callout.non-auditees {
  background-image: linear-gradient(0deg, #f983f1, #f983f1);
  color: #f983f1;
  background-color: #fef3fd;
  border-radius: 0 0 56px;
}

.fr-callout.non-auditees .fr-h2 {
  color: #6e445a;
}

.header-a-certifier {
  display: flex;
  justify-content: space-between;
  border-top: solid 1px #cfcfcf;
}
.titre-a-certifier {
  display: flex;
  gap: 0.3rem;
  align-items: end;
}
.a-certifier {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 1em;
}

.a-certifier.unique {
  grid-template-columns: auto;
}
.green-link {
  color: #18753c;
}

.align-right {
  text-align: right;
}

.mobile-hint {
  align-self: end;
}

@media (max-width: 48em) {
  .filter {
    flex-direction: column;
    align-items: center;
  }

  .a-certifier {
    grid-template-columns: auto;
  }
  .callout-container {
    display: grid;
    grid-template-columns: 50% 50%;
  }
  .fr-callout {
    padding: 0.8rem;
  }

  .header-a-certifier {
    flex-direction: column;
    gap: 0.5rem;
  }
  .header-a-certifier > .titre-a-certifier,
  .header-a-certifier > .fr-btn {
    align-self: center;
  }
}
</style>

<style>
.fr-menu .fr-fieldset.departement-checkbox {
  margin: 0rem;
  padding: 1rem;
  max-height: 400px;
  overflow: auto;
}

.titre-a-certifier .spin {
  margin-bottom: 10px;
}

.charge-certification .spin,
.titre-a-certifier .spin {
  height: 25px;
  line-height: 25px;
}
.charge-certification .spin::before,
.titre-a-certifier .spin::before {
  border: solid 4px var(--background-alt-grey-hover);
  border-bottom-color: var(--background-action-high-blue-france);
  height: 20px;
  width: 20px;
}
</style>
