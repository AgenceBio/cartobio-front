import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js";
import { apiClient } from "@/cartobio-api.js";
import { useCartoBioStorage } from "@/stores/storage.js";

/**
 * @typedef {import('@vue/reactivity').Ref} Ref
 * @typedef {import('@vue/reactivity').UnwrapRef} UnwrapRef
 * @typedef {import('@vue/reactivity').ComputedRef} ComputedRef
 * @typedef {import('@vueuse/shared').RemovableRef} RemovableRef
 */

function date(record) {
  return new Date(record.certification_date_debut || record.audit_date || record.created_at);
}

export const useOperatorStore = defineStore("operator", () => {
  const storage = useCartoBioStorage();

  /**
   * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator}
   */
  const initialState = {};

  /**
   * @type {Ref<UnwrapRef<import('@agencebio/cartobio-types').AgenceBioNormalizedOperator>>}
   */
  const operator = ref(initialState);
  /**
   * @type {Ref<UnwrapRef<null | NormalizedRecordSummary[]>>}
   */
  const records = ref(null);

  /**
   * @type {ComputedRef<NormalizedRecordSummary[]>}
   */
  const recordsByYear = computed(() => {
    if (!records.value?.length) return [];

    // Versions years is same as yearLabel output with fallback to created_at
    return records.value
      .reduce(
        (acc, record) => {
          const year = (
            record.annee_reference_controle || (record.audit_date || record.created_at).split("-")[0]
          ).toString();

          if (!acc.some((e) => e.year === year)) {
            acc.push({ year, records: [] });
          }

          acc.find((e) => e.year === year).records.push(record);
          return acc;
        },
        [
          {
            year: (
              records.value[0].annee_reference_controle ||
              (records.value[0].audit_date || records.value[0].created_at).split("-")[0]
            ).toString(),
            records: [],
          },
        ],
      )
      .sort((a, b) => b.year - a.year);
  });

  /**
   * @param {String} numeroBio
   * @return {Promise<void>}
   */
  async function ready(numeroBio) {
    let operatorData, recordsData;
    if (!navigator.onLine && storage.operators[numeroBio]) {
      ({ operator: operatorData, records: recordsData } = storage.operators[numeroBio]);
    } else {
      try {
        ({ operator: operatorData, records: recordsData } = await getOperator(numeroBio));
      } catch (_e) {
        const e = new Error(
          "Le dossier n'est plus accessible pour votre organisme certificateur, veuillez vérifier sur le portail de notification",
        );
        e.name = "OPERATOR_CHANGEMENT_OC";
        throw e;
      }

      recordsData = recordsData.map((serverR) =>
        storage.syncQueues[serverR.record_id]
          ? storage.operators[numeroBio]?.records.find((storageR) => storageR.record_id === serverR.record_id) ||
            serverR
          : serverR,
      );
    }
    operator.value = operatorData;
    records.value = recordsData.sort((recordA, recordB) => date(recordB) - date(recordA));
  }

  function $reset() {
    operator.value = { ...initialState };
    records.value = null;
  }

  /**
   * @param {Boolean} pinned
   * @return {Promise<void>}
   */
  function updatePinnedStatus(pinned) {
    operator.value = { ...operator.value, epingle: pinned };
  }

  /**
   * @param {Boolean} pinned
   * @return {Promise<void>}
   */
  function markAsConsulted() {
    if (operator.value) {
      apiClient.post(`/v2/operator/${operator.value.numeroBio}/consulte`);
    }
  }

  watch(operator, () => {
    if (operator.value.departement) {
      setCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT, operator.value.departement);
    } else {
      deleteCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT);
    }
  });

  async function getOperator(numeroBio, store = false) {
    const [{ data: operatorData }, { data: recordsData }] = await Promise.all([
      apiClient.get(`/v2/operator/${numeroBio}`),
      apiClient.get(`/v2/operator/${numeroBio}/records`),
    ]);

    // Update storage if requested or if already present
    if (store || storage.operators[numeroBio]) {
      storage.operatorsStorage = {
        ...storage.operatorsStorage,
        [numeroBio]: { operator: operatorData, records: recordsData },
      };
    }

    return { operator: operatorData, records: recordsData };
  }

  return {
    // ref
    operator,
    records,
    // computed
    recordsByYear,
    // store methods
    ready,
    $reset,
    updatePinnedStatus,
    getOperator,
    markAsConsulted,
  };
});
