import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js"
import { apiClient } from "@/cartobio-api.js"
import { getRecord } from "@/stores/record.js"
import { useLocalStorage } from "@vueuse/core"

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

  /**
   * @type {RemovableRef<{
   *   [numeroBio: string]: [import('@agencebio/cartobio-types').AgenceBioNormalizedOperator, import('@agencebio/cartobio-types').NormalizedRecordSummary[]]
   * }>}
   */
  const storage = useLocalStorage('operators', {})

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
    if (!navigator.onLine && storage.value[numeroBio]) {
      const [operatorData, recordsData] = storage.value[numeroBio]
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
        storedOffline: !!localStorage.getItem(`record-${record.record_id}`)
      }))
    })
  }

  async function downloadOperator() {
    storage.value[operator.value.numeroBio] = [operator.value, records.value]
  }

  async function clearDownloadOperator() {
    delete storage.value[operator.value.numeroBio]
  }

  /**
   * Download a record for offline use.
   * Resolves true if the record was successfully downloaded, false if the storage is full.
   * @param recordId
   * @return {Promise<boolean>}
   */
  async function downloadRecord (recordId) {
    try {
      const record = await getRecord(recordId)
      localStorage.setItem(`record-${record.record_id}`, JSON.stringify(record))
      if (records.value.find(r => r.record_id === record.record_id)) {
        records.value.find(r => r.record_id === record.record_id).storedOffline = true
      }
      await downloadOperator()
      const [, recordsSummaryStorage] = storage.value[record.numerobio]
      recordsSummaryStorage.find(r => r.record_id === recordId).storedOffline = true
    } catch (e) {
      if (e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
        return false
      }

      throw e
    }

    return true

  }

  async function clearDownloadRecord (recordId) {
    const numeroBio = JSON.parse(localStorage.getItem(`record-${recordId}`)).numerobio
    localStorage.removeItem(`record-${recordId}`)
    if (records.value?.find(r => r.record_id === recordId)) {
      records.value.find(r => r.record_id === recordId).storedOffline = false
    }
    const [, recordsSummaryStorage] = storage.value[numeroBio]
    recordsSummaryStorage.find(r => r.record_id === recordId).storedOffline = false
    if (recordsSummaryStorage.every(r => localStorage.getItem(`record-${r.record_id}`) === null)) {
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

  // Update storedOffline properties when storage changes
  watch(storage, () => {
    for (let i = 0; i < records.value?.length; i++) {
      records.value[i].storedOffline = !!localStorage.getItem(`record-${records.value[i].record_id}`)
    }
  })

  return {
    // ref
    storage,
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
