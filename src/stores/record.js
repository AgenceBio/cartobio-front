import { defineStore } from 'pinia'
import { reactive } from 'vue'

/** @typedef {import('@/cartobio-api.js').StrictRecord} StrictRecord */

export const useRecordStore = defineStore('record', () => {
  const initialState = {
    record_id: null,
    certification_state: null,
    created_at: null,
    updated_at: null,
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
  }

  function reset() {
    update({ ...initialState, metadata: { ...initialState.metadata } })
  }

  return {
    record,
    // methods
    update,
    reset
  }
})
