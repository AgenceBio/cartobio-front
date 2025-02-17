<route lang="yaml">
meta:
  requiredRoles: ["certif", "audit"]
  skipLinks:
    Recherche: "#search"
  seo:
    title: Liste des exploitations
</route>

<template>
  <div class="header">
    <div class="fr-container fr-h3 fr-px-0 fr-py-5w fr-mb-0">Bienvenue {{ user.prenom }} {{ user.nom }}</div>
  </div>
  <div class="fr-container fr-py-5w background-white">
    <div class="fr-grid-row">
      <div class="fr-col-11 fr-m-auto fr-mb-3w">
        <h2 class="fr-h3">Rechercher une exploitation</h2>
        <form
          @submit.prevent="search(userInput)"
          class="fr-search-bar fr-search-bar--lg fr-mb-3w"
          id="header-search"
          role="search"
          v-if="isInitialized"
        >
          <label class="fr-label" for="search"> Recherche par nom d'exploitation, SIRET ou numéro bio </label>
          <input
            class="fr-input"
            placeholder="Chercher par nom d'opérateur, SIRET ou numéro bio…"
            minlength="1"
            autocomplete="cartobio-operator"
            v-model.trim="userInput"
            autofocustype="search"
            id="search"
            :disabled="!isOnline"
          />
          <button class="fr-btn" type="submit" title="Rechercher" :disabled="isLoading || !isOnline">Rechercher</button>
        </form>
      </div>
      <div class="fr-col-11 fr-m-auto">
        <div v-if="isLoading">
          <Spinner>Chargement des données…</Spinner>
        </div>
        <template v-if="!isLoading && hasOperators">
          <h2 class="fr-h2 text-align-center">Je prépare mes visites</h2>

          <fieldset class="fr-segmented operateurs-segment fr-mb-4w">
            <div class="fr-segmented__elements">
              <div class="fr-segmented__element">
                <input
                  value="operateurs-epingles"
                  checked
                  type="radio"
                  id="operateurs-epingles"
                  name="operateurs-segment"
                  v-model="vue"
                />
                <label class="ri-pushpin-line fr-label" for="operateurs-epingles"> Mes exploitations épingleées </label>
              </div>
              <div class="fr-segmented__element">
                <input
                  value="derniers-operateurs"
                  type="radio"
                  id="derniers-operateurs"
                  name="operateurs-segment"
                  v-model="vue"
                />
                <label class="ri-time-line fr-label" for="derniers-operateurs">
                  Dernières exploitations consultées
                </label>
              </div>
            </div>
          </fieldset>
          <div v-if="vue === 'operateurs-epingles'" class="operateurs-epingles">
            <div
              v-for="{ audit_date, certification_date_debut, certification_state, ...operator } in operators"
              :key="operator.numeroBio"
              class="operator-record"
              @mouseenter="handleMouseEnter(operator)"
              @mouseleave="hideTooltip"
              style="margin-bottom: 10px"
            >
              <OperatorCard
                :operator="operator"
                :operatorDisabled="operatorDisabled"
                :certificationState="certification_state"
                :certificationDateDebut="certification_date_debut"
                :auditDate="audit_date"
                @pin="loadOperators()"
              />
            </div>
          </div>
          <div v-else>TODO</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useOnline } from "@vueuse/core";
import Spinner from "@/components/widgets/Spinner.vue";
import { filterAndSortNotifications } from "@/utils/helper-notification.js";
import { useUserStore } from "@/stores/user";
import { getUserOperatorsForDashboard } from "@/cartobio-api";
import { useOperatorStore } from "@/stores/operator";
import OperatorCard from "@/components/operator/card.vue";

const isInitialized = ref(false);
const isLoading = ref(true);
const isOnline = useOnline();
const operators = ref([]);
const userInput = ref();
const operatorDisabled = ref({});
const operatorStore = useOperatorStore();
const vue = ref("operateurs-epingles");

const hasOperators = computed(() => Boolean(operators.value.length));

const { user, isOc } = useUserStore();

const tooltip = ref({
  visible: false,
  operatorId: null,
});

onMounted(() => {
  loadOperators();
  isLoading.value = true;
});

function search(search) {
  console.log(search);
}

async function loadOperators() {
  if (!isInitialized.value) {
    isInitialized.value = true;
  }
  const res = await getUserOperatorsForDashboard();

  operators.value = res.operators;
  operators.value.forEach((e) => {
    if (e.notifications && e.notifications.length > 0) {
      e.notifications = filterAndSortNotifications(e.notifications);
    }

    checkIfDisabled(e);
  });
  isLoading.value = false;
}

function handleMouseEnter(operator) {
  if (operatorDisabled.value[operator.numeroBio]) {
    tooltip.value.visible = true;
    tooltip.value.operatorId = operator.id;
  }
}
function hideTooltip() {
  tooltip.value.visible = false;
  tooltip.value.operatorId = null;
}

function getStatus(operator) {
  const array = operator.certificats ?? operator.notifications ?? [];

  array.sort((a, b) => new Date(b.dateDemarrage) - new Date(a.dateDemarrage));

  for (const notif of array) {
    const currentStatut = notif.etatCertification || notif.status;

    if (currentStatut != "BROUILLON") {
      if (
        isOc.value &&
        user.value.organismeCertificateur &&
        notif.organismeCertificateurId !== user.value.organismeCertificateur.id
      ) {
        return "ARRETEE";
      }
      return currentStatut;
    }
  }

  return "BROUILLON";
}

function checkIfDisabled(operator) {
  const status = getStatus(operator);

  if (status === "NON ENGAGEE" || status === "BROUILLON") {
    operatorDisabled.value[operator.numeroBio] = true;
    return;
  } else if (status !== "ARRETEE") {
    operatorDisabled.value[operator.numeroBio] = false;
    return;
  }

  if (operatorDisabled.value[operator.numeroBio] != undefined) {
    return;
  }

  if (status === "ARRETEE") {
    operatorDisabled.value[operator.numeroBio] = false;

    operatorStore
      .getOperator(operator.numeroBio)
      .then((res) => {
        operatorDisabled.value[operator.numeroBio] = res.records.length === 0;
      })
      .catch(() => {
        operatorDisabled.value[operator.numeroBio] = true;
      });
  }
}
</script>

<style scoped>
.header {
  background: #e3fdeb;
}
.background-white {
  background-color: white;
}

.header::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 50px;
  background: #e3fdeb;
  z-index: -1;
}
span[aria-selected="true"] {
  font-weight: bold;
}

.help span:not(:last-of-type)::after {
  content: ", ";
}

.list-unstyled {
  --ul-type: none;
  --ul-start: 0;
}

.fr-card__title {
  margin-top: 10px;
}
.operateurs-epingles {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1em;
}
.text-align-center {
  text-align: center;
}
.operateurs-segment {
  display: flex;
  justify-content: center;
}
</style>
