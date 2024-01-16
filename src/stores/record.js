import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import { useFeaturesStore } from "@/stores/index.js"
import { CUSTOM_DIMENSION_DEPARTEMENT, deleteCustomDimension, setCustomDimension } from "@/stats.js"

/** @typedef {import('@/cartobio-api.js').StrictRecord} StrictRecord */

export const useRecordStore = defineStore('record', () => {
  const featuresStore = useFeaturesStore()

  const initialState = {
    record_id: null,
    certification_date_debut: null,
    certification_date_fin: null,
    certification_state: null,
    created_at: null,
    updated_at: null,
    operator: {},
    audit_notes: '',
    audit_demandes: '',
    audit_history: [],
    metadata: {}
  }

  /** @type {reactive<StrictRecord>} */
  const record = reactive({
    ...initialState,
    audit_history: [ ...initialState.audit_history ],
    metadata: { ...initialState.metadata }
  })

  /**
   * Soft update of a record
   *
   * Use case: when navigating from /parcellaire/:id to /parcellaire/:id/new-stuff
   * @param {import('@/cartobio-api').Record} updatedRecord
   */
  function update (updatedRecord) {
    Object.entries(record).forEach(([key]) => {
      if (key in updatedRecord) {
        record[key] = updatedRecord[key]
      }
    })

    if (updatedRecord.parcelles) {
      featuresStore.setAll(updatedRecord.parcelles.features)
    }
  }

  /**
   * Replace a record with new values
   * Use case: when navigating from /parcellaire/1234 to /parcellaire/9999 or even /parcellaires then /parcellaire/1234
   *
   * @param {import('@/cartobio-api').Record} maybeNewRecord
   */
  function replace (maybeNewRecord) {
    reset()
    update(maybeNewRecord)
  }

  function reset() {
    update({ ...initialState, metadata: { ...initialState.metadata } })
    featuresStore.$reset()
  }

  const exists = computed(() => Boolean(record.record_id))
  const isSetup = computed(() => Boolean(record.record_id && 'source' in record.metadata))
  const hasFeatures = computed(() => featuresStore.hasFeatures)

  watch(record, () => {
    if (record.operator?.departement) {
      setCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT, record.operator.departement)
    } else {
      deleteCustomDimension(CUSTOM_DIMENSION_DEPARTEMENT)
    }
  })

  return {
    record,
    // computed
    exists,
    hasFeatures,
    isSetup,
    // methods
    $reset: reset,
    replace,
    reset,
    update
  }
})
