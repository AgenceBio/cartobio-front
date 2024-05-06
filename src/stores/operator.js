import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js"
import { apiClient } from "@/cartobio-api.js"
import { getRecord } from "@/stores/record.js"
import { useLocalStorage } from "@vueuse/core"

/**
 * @typedef {import('@vue/reactivity').Ref} Ref
 * @typedef {import('@vue/reactivity').UnwrapRef} UnwrapRef
 */

function date(record) {
  return new Date(record.certification_date_debut || record.audit_date || record.created_at)
}

export const useOperatorStore = defineStore('operator', () => {
  const operatorsStorage = useLocalStorage('operators', {})

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
    if (!navigator.onLine && operatorsStorage.value[numeroBio]) {
      const [operatorData, recordsData] = operatorsStorage.value[numeroBio]
      operator.value = operatorData
      records.value = recordsData
      return
    }

    if (String(operator.value.numeroBio) !== numeroBio) {
      const { data: fetchedOperator } = await apiClient.get(`/v2/operator/${numeroBio}`)
      operator.value = fetchedOperator
      records.value = null
    }

    apiClient.get(`/v2/operator/${numeroBio}/records`).then(({ data: r }) => {
      records.value = r.sort((recordA, recordB) => date(recordB) - date(recordA)).map(record => ({
        ...record,
        storedOffline: localStorage.getItem(`record-${record.record_id}`)
      }))
    })
  }

  async function downloadOperator() {
    operatorsStorage.value[operator.value.numeroBio] = [operator.value, records.value]
  }

  async function clearDownloadOperator() {
    delete operatorsStorage.value[operator.value.numeroBio]
  }

  async function downloadRecord (recordId) {
    const record = await getRecord(recordId)
    localStorage.setItem(`record-${record.record_id}`, JSON.stringify(record))
    records.value.find(r => r.record_id === record.record_id).storedOffline = true
    await downloadOperator()
  }

  async function clearDownloadRecord (recordId) {
    localStorage.removeItem(`record-${recordId}`)
    records.value.find(r => r.record_id === recordId).storedOffline = false
    if (records.value.every(r => !r.storedOffline)) {
      await clearDownloadOperator()
    }
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

  return {
    // ref
    operator,
    records,
    // computed
    recordsByYear,
    // methods
    downloadOperator,
    clearDownloadOperator,
    downloadRecord,
    clearDownloadRecord,
    ready,
    $reset
  }
})
