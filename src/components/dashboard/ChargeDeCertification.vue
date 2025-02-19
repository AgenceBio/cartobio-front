<template>
  <div class="filter fr-mb-2w">
    <button class="fr-btn" @click="departementShown = true">Départements</button>
    <div class="fr-menu" ref="departementSelect">
      <div class="fr-menu__list">
        <DateFilter v-if="departementShown" v-model="selectedDepartements" />
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
    <div class="fr-callout certifiees">
      <span class="fr-h2 fr-callout__title">{{ summary.countCertifiees }}</span>
      <div class="flex-center">
        <p class="fr-callout__text">Exploitations certifiées</p>
        <img src="@gouvfr/dsfr/artwork/pictograms/system/success.svg" role="illustration" alt="" height="48px" />
      </div>
    </div>
    <div class="fr-callout en-attentes">
      <span class="fr-h2 fr-callout__title">{{ summary.countEnAttentes }}</span>
      <div class="flex-center">
        <p class="fr-callout__text">En attente de certification</p>
        <img
          src="@gouvfr/dsfr/artwork/pictograms/document/document-signature.svg"
          role="illustration"
          alt=""
          height="48px"
        />
      </div>
    </div>
    <div class="fr-callout non-auditees">
      <span class="fr-h2 fr-callout__title">{{ summary.countNonAuditees }}</span>
      <div class="flex-center">
        <p class="fr-callout__text">Non auditées / contrôlées</p>
        <img src="@gouvfr/dsfr/artwork/pictograms/system/warning.svg" role="illustration" alt="" height="48px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { getDashboardSummary } from "@/cartobio-api";
import DateFilter from "../operator/DateFilter.vue";
import { onClickOutside } from "@vueuse/core";

const isLoading = ref(true);
const isSearching = ref(true);
const summary = ref({});
const departementShown = ref(false);
const selectedDepartements = ref([]);
const departementSelect = ref(null);

const lastTwoYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1];
});
const annneeReference = ref(lastTwoYears.value[0]);

watch(
  [selectedDepartements, annneeReference],
  () => {
    console.log("la ?", selectedDepartements.value, annneeReference.value);
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

  console.log(summary.value);
  isSearching.value = false;
  isLoading.value = false;
}

onClickOutside(departementSelect, ({ target }) => {
  if (!target.classList.contains("fr-menu")) {
    departementShown.value = false;
  }
});

const removeDepartment = (code) => {
  console.log(code, selectedDepartements.value);
  selectedDepartements.value = selectedDepartements.value.filter((dep) => dep.code != code);
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

.flex-center {
  display: flex;
  align-items: center;
}

.departements-tag {
  gap: 0.2rem;
  display: flex;
  flex-wrap: wrap;
}

.callout-container {
  display: flex;
  justify-content: space-between;
}

@media (min-width: 48em) {
  .callout-container .fr-callout {
    padding: 1rem 2rem;
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

.fr-callout.certifiees > .fr-h2 {
  color: #37635f;
}

.fr-callout.en-attentes {
  background-image: linear-gradient(0deg, #4cb4bd, #4cb4bd);
  color: #4cb4bd;
  background-color: #e5fbfd;
  border-radius: 0 0 56px;
}
.fr-callout.en-attentes > .fr-h2 {
  color: #006a6f;
}
.fr-callout.non-auditees {
  background-image: linear-gradient(0deg, #f983f1, #f983f1);
  color: #f983f1;
  background-color: #fef3fd;
  border-radius: 0 0 56px;
}

.fr-callout.non-auditees > .fr-h2 {
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
