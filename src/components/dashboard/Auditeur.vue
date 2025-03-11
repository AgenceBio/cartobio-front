<template>
  <h2 class="fr-h2 text-align-center fr-mb-4w">Je prépare mes visites</h2>
  <div v-if="isLoading">
    <Spinner>Chargement des données…</Spinner>
  </div>
  <template v-else>
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
          <label class="fr-label" for="operateurs-epingles">
            <span class="ri-pushpin-line fr-mr-1w" aria-hidden="true"></span>
            Mes exploitations épingleées
          </label>
        </div>
        <div class="fr-segmented__element">
          <input
            value="derniers-operateurs"
            type="radio"
            id="derniers-operateurs"
            name="operateurs-segment"
            v-model="vue"
          />
          <label class="fr-label" for="derniers-operateurs">
            <span class="ri-time-line fr-mr-1w" aria-hidden="true"></span>
            Dernières exploitations consultées
          </label>
        </div>
      </div>
    </fieldset>
    <div v-if="vue === 'operateurs-epingles'" class="operateurs-epingles">
      <div
        v-for="{ record_id, audit_date, certification_date_debut, certification_state, ...operator } in pinnedOperators"
        :key="operator.numeroBio"
        class="operator-record"
        @mouseenter="handleMouseEnter(operator)"
        @mouseleave="hideTooltip"
      >
        <OperatorCard
          :operator="operator"
          :operatorDisabled="operatorDisabled"
          :certificationState="certification_state"
          :certificationDateDebut="certification_date_debut"
          :auditDate="audit_date"
          :record_id="record_id"
          :organismeOc="user.organismeCertificateur"
          @pin="loadOperators()"
        />
      </div>
    </div>
    <div v-else class="operateurs-consultes">
      <div
        v-for="{
          record_id,
          audit_date,
          certification_date_debut,
          certification_state,
          ...operator
        } in consultedOperators"
        :key="operator.numeroBio"
        class="operator-record"
        @mouseenter="handleMouseEnter(operator)"
        @mouseleave="hideTooltip"
      >
        <OperatorCard
          :operator="operator"
          :operatorDisabled="operatorDisabled"
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
</template>

<script setup>
import { onMounted, ref } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { useUserStore } from "@/stores/user";
import { getUserOperatorsForDashboard } from "@/cartobio-api";
import { useOperatorStore } from "@/stores/operator";
import OperatorCard from "@/components/operator/Card.vue";

const isInitialized = ref(false);
const isLoading = ref(true);
const pinnedOperators = ref([]);
const consultedOperators = ref([]);
const operatorDisabled = ref({});
const operatorStore = useOperatorStore();
const vue = ref("operateurs-epingles");

const { user } = useUserStore();

const tooltip = ref({
  visible: false,
  operatorId: null,
});

onMounted(() => {
  isLoading.value = true;
  loadOperators();
});

async function loadOperators() {
  const res = await getUserOperatorsForDashboard();

  pinnedOperators.value = res.pinnedOperators;
  pinnedOperators.value.forEach((e) => {
    checkIfDisabled(e);
  });
  consultedOperators.value = res.consultedOperators;
  consultedOperators.value.forEach((e) => {
    checkIfDisabled(e);
  });
  isLoading.value = false;
  isInitialized.value = true;
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
  const notif = operator.notifications ?? {};

  return notif.etatCertification;
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

  if (
    user.value.organismeCertificateur &&
    operator.organismeCertificateur.id !== user.value.organismeCertificateur.id
  ) {
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
.operateurs-epingles,
.operateurs-consultes {
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
.content {
  border-top: solid 1px #cfcfcf;
}
</style>
