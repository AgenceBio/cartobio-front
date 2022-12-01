import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useRecordStore = defineStore('record', () => {
  const record = reactive({
    record_id: null,
    certification_state: null,
    created_at: null,
    updated_at: null,
    audit_notes: '',
    audit_demandes: '',
    audit_history: []
  })

  function update (updatedRecord) {
    Object.entries(record).forEach(([key]) => {
      if (key in updatedRecord) {
        record[key] = updatedRecord[key]
      }
    })
  }

  return {
    record,
    // methods
    update,
  }
})
