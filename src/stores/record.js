import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { useFeaturesStore } from "@/stores/features.js"
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import bbox from '@turf/bbox'
import { useOperatorStore } from "@/stores/operator.js"
import { apiClient, createOperatorRecord } from "@/cartobio-api.js"

/**
 * @param {UUID} recordId
 * @return {Promise<NormalizedRecord>}
 */
export async function getRecord (recordId) {
  if (!navigator.onLine && localStorage.getItem(`record-${recordId}`)) {
    return JSON.parse(localStorage.getItem(`record-${recordId}`))
  }

  const { data } = await apiClient.get(`/v2/audits/${recordId}`)
  if (localStorage.getItem(`record-${recordId}`)) {
    localStorage.setItem(`record-${recordId}`, JSON.stringify(data))
  }

  return data
}

/**
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeature} CartoBioFeature
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 */

export const useRecordStore = defineStore('record', () => {
  const featuresStore = useFeaturesStore()
  const operatorStore = useOperatorStore()
  const sets = useFeaturesSetsStore()

  const initialState = {
    numerobio: null,
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

  /** @type {computed<import('geojson').BBox|[]>} */
  const bounds = computed(() => {
    // prioritize features over locations
    if (featuresStore.hasFeatures) {
      return bbox(featuresStore.collection)
    }

    const operator = operatorStore.operator
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

    if (updatedRecord.record_id) {
      featuresStore.recordId = updatedRecord.record_id
    }

    if (updatedRecord.parcelles) {
      featuresStore.setAll(updatedRecord.parcelles.features)
    }
  }

  /**
   * Update non-geographical data for a record (name, audit and certification dates, etc.)
   * @param {Partial<Omit<NormalizedRecord, 'parcelles', 'operator'>>} patch
   * @returns {Promise<void>}
   */
  async function updateInfo (patch) {
    const { data: updatedRecord } = await apiClient.patch(`/v2/audits/${record.record_id}`, patch)
    update(updatedRecord)

    /* Update also version info in operatorStore version list */
    const recordSummary = operatorStore.records.find(record => record.record_id === updatedRecord.record_id)
    Object.entries(patch).forEach(([key]) => {
      recordSummary[key] = updatedRecord[key]
    })
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
    sets.$reset()
  }

  async function ready(recordId) {
    if (record.record_id === recordId) {
      launchRevalidate()
      return
    }

    const newRecord = await getRecord(recordId)
    await operatorStore.ready(newRecord.numerobio)
    reset()
    update(newRecord)
  }

  function launchRevalidate() {
    getRecord(record.record_id).then(update)
  }

  async function duplicate(id) {
    const recordSummary = operatorStore.records.find(record => record.record_id === id)
    const record = await getRecord(id)
    const newRecord = await createOperatorRecord(operatorStore.operator.numeroBio, {
      versionName: `Copie de ${record.version_name}`,
      geojson: record.parcelles,
      metadata: {
        provenance: window.location.host,
        source: 'Copie de version existante',
        copy_of: record.record_id
      }
    })
    operatorStore.records?.unshift({
      ...newRecord,
      parcelles: recordSummary.parcelles,
      surface: recordSummary.surface,
    })
  }


  /**
   * @type {ComputedRef<Boolean>}
   */
  const exists = computed(() => Boolean(record.record_id))

  /**
   * @type {ComputedRef<Boolean>}
   */
  const isSetup = computed(() => Boolean(record.record_id && 'source' in record.metadata))

  /**
   * @type {ComputedRef<Boolean>}
   */
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
    updateInfo,
    ready,
    duplicate,
  }
})
