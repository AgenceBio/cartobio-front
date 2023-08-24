import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { useFeaturesStore } from "@/stores/index.js"

/** @typedef {import('@/cartobio-api.js').StrictRecord} StrictRecord */

export const useRecordStore = defineStore('record', () => {
  const featuresStore = useFeaturesStore()

  const initialState = {
    record_id: null,
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

  function reset() {
    update({ ...initialState, metadata: { ...initialState.metadata } })
    featuresStore.setAll([])
  }

  const exists = computed(() => Boolean(record.record_id))
  const isSetup = computed(() => Boolean(record.record_id && record.metadata.source))

  return {
    record,
    // computed
    exists,
    isSetup,
    // methods
    update,
    reset
  }
})
