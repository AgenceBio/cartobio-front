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

  const imported = ref(null);

  /**
   * @type {ComputedRef<NormalizedRecordSummary[]>}
   */
  const recordsByYear = computed(() => {
    if (!records.value?.length) return [];

    // Versions years is same as yearLabel output with fallback to created_at
    return records.value
      .filter((r) => r.certification_state !== "OPERATOR_DRAFT")
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
      .sort((a, b) => b.year - a.year)
      .reduce((acc, curr, i) => {
        if (i === 0) {
          acc.push(curr);
          return acc;
        }

        const prev = acc[acc.length - 1];
        let y = Number(prev.year) - 1;

        while (y > Number(curr.year)) {
          acc.push({ year: y.toString(), records: [] });
          y--;
        }

        acc.push(curr);
        return acc;
      }, []);
  });

  /**
   * @type {ComputedRef<NormalizedRecordSummary[]>}
   */
  const recordsByYearAll = computed(() => {
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
      .sort((a, b) => b.year - a.year)
      .reduce((acc, curr, i) => {
        if (i === 0) {
          acc.push(curr);
          return acc;
        }

        const prev = acc[acc.length - 1];
        let y = Number(prev.year) - 1;

        while (y > Number(curr.year)) {
          acc.push({ year: y.toString(), records: [] });
          y--;
        }

        acc.push(curr);
        return acc;
      }, []);
  });

  /**
   * @param {String} numeroBio
   * @return {Promise<void>}
   */
  async function ready(numeroBio) {
    let operatorData, recordsData, importData;
    if (!navigator.onLine && storage.operators[numeroBio]) {
      ({ operator: operatorData, records: recordsData, import: importData } = storage.operators[numeroBio]);
    } else {
      try {
        ({ operator: operatorData, records: recordsData, import: importData } = await getOperator(numeroBio));
      } catch (e) {
        e.name = "OPERATOR_CHANGEMENT_OC";
        e.status = 401;
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
    imported.value = importData;
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
    const [{ data: operatorData }, { data: recordsData }, { data: importData }] = await Promise.all([
      apiClient.get(`/v2/operator/${numeroBio}`),
      apiClient.get(`/v2/operator/${numeroBio}/records`),
      apiClient.get(`/v2/operator/${numeroBio}/importData`),
    ]);
    // Update storage if requested or if already present
    if (store || storage.operators[numeroBio]) {
      storage.operatorsStorage = {
        ...storage.operatorsStorage,
        [numeroBio]: { operator: operatorData, records: recordsData, import: importData.data },
      };
    }

    return { operator: operatorData, records: recordsData, import: importData.data };
  }

  return {
    // ref
    operator,
    records,
    imported,
    // computed
    recordsByYear,
    recordsByYearAll,
    // store methods
    ready,
    $reset,
    updatePinnedStatus,
    getOperator,
    markAsConsulted,
  };
});
