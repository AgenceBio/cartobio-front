import { defineStore } from "pinia"
import { getRecord } from "@/stores/record.js"
import { computed } from "vue"
import { useLocalStorage } from "@vueuse/core"
import { getOperator, getRecordsSummary } from "@/stores/operator.js"

/**
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator} AgenceBioNormalizedOperator
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecordSummary} NormalizedRecordSummary
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 */

export const useCartoBioStorage = defineStore('storage', () => {
  /**
   * @type {RemovableRef<{
   *   [numeroBio: string]: {
   *     operator: AgenceBioNormalizedOperator,
   *     records: NormalizedRecordSummary[]
   *   }
   * }>}
   */
  const operatorsStorage = useLocalStorage('operators', {})

  /**
   * @type {RemovableRef<{
   *   [recordId: string]: NormalizedRecord
   * }>}
   */
  const recordsStorage = useLocalStorage('records', {})

  /**
   * @type {ComputedRef<{[numeroBio: string]: {operator: AgenceBioNormalizedOperator, records: NormalizedRecordSummary[]}}>}
   */
  const operators = computed(() => operatorsStorage.value)

  /**
   * @type {ComputedRef<{[recordId: string]: NormalizedRecord}>}
   */
  const records = computed(() => recordsStorage.value)

  /**
   * Add an operator to the store.
   * @param numeroBio
   * @return {Promise<void>}
   */
  async function addOperator(numeroBio) {
    const [operator, records] = await Promise.all([
      getOperator(numeroBio),
      getRecordsSummary(numeroBio)
    ])
    operatorsStorage.value[numeroBio] = { operator, records }
  }

  /**
   * Clear an operator from the store.
   * @param numeroBio
   */
  function clearOperator(numeroBio) {
    delete operatorsStorage.value[numeroBio]
  }

  /**
   * Download a record for offline use.
   * @param recordId
   * @return {Promise<boolean>} - true if the record was successfully downloaded, false if the storage is full.
   */
  async function addRecord (recordId) {
    try {
      const record = await getRecord(recordId)
      recordsStorage.value[record.record_id] = record
      await addOperator(record.numerobio)
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

  /**
   * Clear a record from the store.
   * @param recordId
   * @return {boolean} - true if the record was successfully cleared, false if it was not found.
   */
  function clearRecord (recordId) {
    const numeroBio = recordsStorage.value[recordId]?.numerobio
    if (!numeroBio) return false
    delete recordsStorage.value[recordId]

    if (Object.entries(recordsStorage.value).every(([, r]) => r.numerobio !== numeroBio)) {
      clearOperator(numeroBio)
    }

    return true
  }

  return {
    operators,
    records,
    addRecord,
    clearRecord
  }
})
