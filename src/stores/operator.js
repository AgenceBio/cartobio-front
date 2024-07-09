import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js"
import { apiClient } from "@/cartobio-api.js"
import { useCartoBioStorage } from "@/stores/storage.js"

/**
 * @typedef {import('@vue/reactivity').Ref} Ref
 * @typedef {import('@vue/reactivity').UnwrapRef} UnwrapRef
 * @typedef {import('@vue/reactivity').ComputedRef} ComputedRef
 * @typedef {import('@vueuse/shared').RemovableRef} RemovableRef
 */

function date(record) {
  return new Date(record.certification_date_debut || record.audit_date || record.created_at)
}

export const useOperatorStore = defineStore('operator', () => {
  const storage = useCartoBioStorage()

  /**
   * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator}
   */
  const initialState = {}

  /**
   * @type {Ref<UnwrapRef<import('@agencebio/cartobio-types').AgenceBioNormalizedOperator>>}
   */
  const operator = ref(initialState)
  /**
   * @type {Ref<UnwrapRef<null | NormalizedRecordSummary[]>>}
   */
  const records = ref(null)

  /**
   * @type {ComputedRef<NormalizedRecordSummary[]>}
   */
  const recordsByYear = computed(() => {
    if (!records.value?.length) return [];

    // Versions years is same as yearLabel output with fallback to created_at
    return records.value.reduce((acc, record) => {
      const year = (record.certification_date_debut || record.audit_date || record.created_at).split('-')[0]
      if (acc[acc.length - 1].year !== year) {
        acc.push({ year, records: [] })
      }

      acc[acc.length - 1].records.push(record)
      return acc
    }, [{ year: records.value[0].created_at.split('-')[0], records: [] }])
  })

  /**
   * @param {String} numeroBio
   * @return {Promise<void>}
   */
  async function ready (numeroBio) {
    let operatorData, recordsData
    if (!navigator.onLine && storage.operators[numeroBio]) {
      ({ operator: operatorData, records: recordsData } = storage.operators[numeroBio])
    } else {
      ({ operator: operatorData, records: recordsData } = await getOperator(numeroBio))
      recordsData = recordsData.map(serverR => storage.syncQueues[serverR.record_id] ?
          storage.operators[numeroBio]?.records.find(storageR => storageR.record_id === serverR.record_id) || serverR
          : serverR
      )
    }

    operator.value = operatorData
    records.value = recordsData.sort((recordA, recordB) => date(recordB) - date(recordA))
  }

  function $reset () {
    operator.value = { ...initialState }
    records.value = null
  }

  watch(operator, () => {
    if (operator.value.departement) {
      setCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT, operator.value.departement)
    } else {
      deleteCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT)
    }
  })

  async function getOperator (numeroBio, store = false) {
    const [{ data: operatorData }, { data: recordsData }] = await Promise.all([
        apiClient.get(`/v2/operator/${numeroBio}`),
        apiClient.get(`/v2/operator/${numeroBio}/records`)
    ])

    // Update storage if requested or if already present
    if (store || (storage.operators[numeroBio])) {
      storage.operatorsStorage = {
        ...storage.operatorsStorage,
        [numeroBio]: { operator: operatorData, records: recordsData }
      }
    }

    return { operator: operatorData, records: recordsData }
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
    getOperator,
  }
})
