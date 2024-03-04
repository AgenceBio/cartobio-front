import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { useFeaturesStore } from "@/stores/index.js"
import bbox from '@turf/bbox'
import { useOperatorStore } from "@/stores/operator.js"
import { getRecord } from "@/cartobio-api.js"

/**
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 */

export const useRecordStore = defineStore('record', () => {
  const featuresStore = useFeaturesStore()

  const initialState = {
    record_id: null,
    version_name: null,
    certification_date_debut: null,
    certification_date_fin: null,
    certification_state: null,
    created_at: null,
    updated_at: null,
    audit_date: null,
    audit_notes: '',
    audit_demandes: '',
    audit_history: [],
    metadata: {}
  }

  /** @type {reactive<NormalizedRecord>} */
  const record = reactive({
    ...initialState,
    audit_history: [ ...initialState.audit_history ],
    metadata: { ...initialState.metadata }
  })

  /** @type {computed<[]>} */
  const bounds = computed(() => {
    // prioritize features over locations
    if (featuresStore.hasFeatures) {
      return bbox(featuresStore.collection)
    }

    const operator = useOperatorStore().operator
    // otherwise fallback on advertised operator locations
    if (Array.isArray(operator.adressesOperateurs)) {
      const features = operator.adressesOperateurs.map(({ lat, long }) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [long, lat]
        }
      }))

      return bbox({ type: 'FeatureCollection', features })
    }

    return []
  })

  /**
   * Soft update of a record
   *
   * Use case: when navigating from /parcellaire/:id to /parcellaire/:id/new-stuff
   * @param {NormalizedRecord} updatedRecord
   */
  function update (updatedRecord = {}) {
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
   * @param {NormalizedRecord} maybeNewRecord
   */
  function replace (maybeNewRecord) {
    reset()
    update(maybeNewRecord)
  }

  function reset() {
    update({ ...initialState, metadata: { ...initialState.metadata } })
    featuresStore.$reset()
  }

  async function ready(recordId) {
    if (record.record_id === recordId) {
      launchRevalidate()
      return
    }

    const newRecord = await getRecord(recordId)
    reset()
    update(newRecord)
  }

  function launchRevalidate() {
    getRecord(record.record_id).then(update)
  }


    const exists = computed(() => Boolean(record.record_id))
  const isSetup = computed(() => Boolean(record.record_id && 'source' in record.metadata))
  const hasFeatures = computed(() => featuresStore.hasFeatures)

  return {
    record,
    // computed
    bounds,
    exists,
    hasFeatures,
    isSetup,
    // methods
    $reset: reset,
    replace,
    reset,
    update,
    ready
  }
})
