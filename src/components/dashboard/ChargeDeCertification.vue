<template>
  <div class="filter fr-mb-2w">
    <button
      class="fr-btn fr-btn--secondary fr-icon fr-icon-edit-line fr-btn--icon-right"
      @click="departementShown = true"
    >
      Départements
    </button>
    <div class="fr-menu" ref="departementSelect">
      <div class="fr-menu__list" :class="{ 'fr-hidden': !departementShown }">
        <DepartementFilter
          v-if="userDepartements != undefined"
          v-model="selectedDepartements"
          :initial-value="userDepartements"
          @update:modelValue="persistDepartements()"
        />
      </div>
    </div>
    <div class="flex">
      <legend class="">Année de référence</legend>
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
  </div>
  <div v-if="selectedDepartements.length > 0" class="departements-tag fr-mb-2w">
    <button
      v-for="value in selectedDepartements"
      :key="value.code"
      class="fr-tag fr-tag--sm fr-tag--dismiss"
      @click="removeDepartment(value.code)"
    >
      <span>{{ `${value.nom} (${value.code})` }}</span>
    </button>
  </div>
  <div v-if="isLoading">
    <Spinner>Chargement des données…</Spinner>
  </div>
  <div v-else class="callout-container">
    <button class="fr-callout certifiees" @click="goToCertifiees">
      <div class="callout-content">
        <div>
          <span class="fr-h2 fr-callout__title">{{ summary.countCertifiees }}</span>
          <p class="fr-callout__text">Exploitations certifiées</p>
        </div>
        <img src="@gouvfr/dsfr/artwork/pictograms/system/success.svg" role="illustration" alt="" height="48px" />
      </div>
    </button>
    <button class="fr-callout en-attentes" @click="goToEnAttentes">
      <div class="callout-content">
        <div>
          <span class="fr-h2 fr-callout__title">{{ summary.countEnAttentes }}</span>
          <p class="fr-callout__text">En attente de certification</p>
        </div>
        <img src="../../assets/dsfr/document/conclusion.svg" role="illustration" alt="" height="48px" />
      </div>
    </button>
    <button class="fr-callout non-auditees" @click="goToNonAuditees">
      <div class="callout-content">
        <div>
          <span class="fr-h2 fr-callout__title">{{ summary.countNonAuditees }}</span>
          <p class="fr-callout__text">Non auditées / contrôlées</p>
        </div>
        <img src="@gouvfr/dsfr/artwork/pictograms/system/warning.svg" role="illustration" alt="" height="48px" />
      </div>
    </button>
  </div>
  <div class="header-a-certifier fr-mt-4w fr-mb-3w">
    <div class="titre-a-certifier">
      <h3 class="fr-h3 fr-mb-0">Parcellaire{{ operators.length > 1 ? "s" : "" }} à certifier</h3>
      <span class="fr-text--lead fr-mb-0">({{ countToCertify }})</span>
    </div>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-btn--sm fr-icon-arrow-right-line green-link"
      @click="goToACertifier"
    >
      Voir tout
    </button>
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
        :show-certification-badge="false"
        @pin="loadOperators()"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
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
const userDepartements = ref(undefined);
const countToCertify = ref(0);
const operators = ref([]);
const user = useUserStore();

const lastTwoYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1];
});
const annneeReference = ref(lastTwoYears.value[0]);

onMounted(async () => {
  userDepartements.value = await userStore.getDepartements();
});

async function loadOperators() {
  const res = await searchOperators({
    input: "",
    page: 1,
    limit: 10,
    filter: {
      anneeReferenceCertification: annneeReference.value,
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

watch(
  [selectedDepartements, annneeReference, userDepartements],
  () => {
    loadSummary();
    loadOperators();
  },
  { immediate: true },
);
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
    departementsToSave.some((s) => !userDepartements.value.include(s))
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
}
.callout-container .fr-callout {
  flex: 1;
}
@media (min-width: 48em) {
  .callout-container .fr-callout {
    padding: 1.5rem 3rem 1.5rem 2rem;
  }
}
.callout-container .fr-callout__text {
  font-size: 1rem;
  line-height: 1.5rem;
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
}
.titre-a-certifier {
  display: flex;
  gap: 0.3rem;
  align-items: end;
}
.a-certifier {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1em;
}

.a-certifier.unique {
  grid-template-columns: auto;
}
.green-link {
  color: #18753c;
}
</style>

<style>
.fr-menu .fr-fieldset.departement-checkbox {
  margin: 0rem;
  padding: 1rem;
  max-height: 400px;
  overflow: auto;
}
</style>
