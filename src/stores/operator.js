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

export const getOperator = async (numeroBio) => {
  const { data } = await apiClient.get(`/v2/operator/${numeroBio}`)
  return data
}

export const getRecordsSummary = async (numeroBio) => {
  const { data } = await apiClient.get(`/v2/operator/${numeroBio}/records`)
  return data
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
   * @type {Ref<UnwrapRef<null | import('@agencebio/cartobio-types').NormalizedRecordSummary[]>>}
   */
  const records = ref(null)

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
    if (!navigator.onLine && storage.operators[numeroBio]) {
      const {operator: operatorData, records: recordsData} = storage.operators[numeroBio]
      operator.value = operatorData
      records.value = recordsData
      return
    }

    if (String(operator.value.numeroBio) !== numeroBio) {
      operator.value = await getOperator(numeroBio)
      records.value = null
    }

    getRecordsSummary(numeroBio).then(r => {
      records.value = r.sort((recordA, recordB) => date(recordB) - date(recordA)).map(record => ({
        ...record,
        storedOffline: !!storage.records[record.record_id]
      }))
    })
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

  // Update storedOffline properties when storage changes
  watch(storage, () => {
    for (let i = 0; i < records.value?.length; i++) {
      records.value[i].storedOffline = !!localStorage.getItem(`record-${records.value[i].record_id}`)
    }
  })

  return {
    // ref
    operator,
    records,
    // computed
    recordsByYear,
    ready,
    $reset
  }
})
