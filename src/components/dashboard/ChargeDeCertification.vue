<template>
  <div class="filter fr-mb-2w">
    <button class="fr-btn fr-btn--secondary" @click="departementShown = true">Départements</button>
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
      <span>{{ `${value.nom}(${value.code})` }}</span>
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
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { getDashboardSummary } from "@/cartobio-api";
import DepartementFilter from "../operator/DepartementFilter.vue";
import { onClickOutside } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(true);
const isSearching = ref(true);
const summary = ref({});
const departementShown = ref(false);
const selectedDepartements = ref([]);
const departementSelect = ref(null);
const userDepartements = ref(undefined);

const lastTwoYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1];
});
const annneeReference = ref(lastTwoYears.value[0]);

onMounted(async () => {
  userDepartements.value = await userStore.getDepartements();
  console.log(userDepartements.value);
});

watch(
  [selectedDepartements, annneeReference, userDepartements],
  () => {
    loadSummary();
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
    padding: 1rem 3rem 1rem 2rem;
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
</style>

<style>
.fr-menu .fr-fieldset.departement-checkbox {
  margin: 0rem;
  padding: 1rem;
  max-height: 400px;
  overflow: auto;
}
</style>
