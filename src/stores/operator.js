import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js"
import { getOperator, getOperatorRecords } from "@/cartobio-api.js"

/**
 * @typedef {import('@vue/reactivity').Ref} Ref
 * @typedef {import('@vue/reactivity').UnwrapRef} UnwrapRef
 */

export const useOperatorStore = defineStore('operator', () => {
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

    return records.value.reduce((acc, record) => {
      const year = record.created_at.split('-')[0]
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
    if (operator.value.numeroBio === numeroBio) return

    operator.value = await getOperator(numeroBio)
    records.value = null
    getOperatorRecords(numeroBio).then((r) => records.value = r)
  }

  watch(operator, () => {
    if (operator.value.departement) {
      setCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT, operator.value.departement)
    } else {
      deleteCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT)
    }
  })

  return {
    operator,
    records,
    recordsByYear,
    ready
  }
})
