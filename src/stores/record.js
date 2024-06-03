import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import { useFeaturesStore } from "@/stores/features.js"
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import bbox from '@turf/bbox'
import { useOperatorStore } from "@/stores/operator.js"
import { apiClient, createOperatorRecord } from "@/cartobio-api.js"
import { SyncOperation, useCartoBioStorage } from "@/stores/storage.js"

/**
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeature} CartoBioFeature
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 */

export const useRecordStore = defineStore('record', () => {
  const storage = useCartoBioStorage()
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
   * Soft partial update of a record, used internally to update the store with new values.
   *
   * You should not use this method to update a record from outside the store
   * (there are dedicated methods for this which handle offline and syncing).
   * External use case should be limited to previews of yet non-existing records.
   *
   * @param {Partial<NormalizedRecord>} updatedRecord
   */
  function update (updatedRecord = {}) {
    // Prevent updating with outdated or identical data
    if (updatedRecord.updated_at && record.updated_at && updatedRecord.updated_at <= record.updated_at) {
      return
    }

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
   *
   * @param {Partial<Omit<NormalizedRecord, 'parcelles', 'operator'>>} patch
   * @returns {Promise<void>}
   */
  function updateInfo (patch) {
    storage.addSyncOperation(record.record_id, new SyncOperation(SyncOperation.ACTIONS.RECORD_INFO, patch))
  }

  function $reset() {
    update({ ...initialState, metadata: { ...initialState.metadata } })
    featuresStore.$reset()
    sets.$reset()
  }

  async function ready(recordId) {
    if (storage.syncQueues[recordId] || !navigator.onLine && storage.records[recordId]) {
      await operatorStore.ready(storage.records[recordId].numerobio)
      $reset()
      update(storage.records[recordId])
      return
    }

    if (record.record_id === recordId) {
      launchRevalidate()
      return
    }

    const newRecord = await getRecord(recordId)
    await operatorStore.ready(newRecord.numerobio)
    $reset()
    update(newRecord)
  }

  function launchRevalidate() {
    getRecord(record.record_id).then(update)
  }

  /**
   * @param id
   * @return {Promise<NormalizedRecord>}
   */
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
    return newRecord
  }

  /**
   * @param {UUID} recordId
   * @param {boolean} store
   * @return {Promise<NormalizedRecord>}
   */
  async function getRecord (recordId, store= false) {
    const { data } = await apiClient.get(`/v2/audits/${recordId}`)

    // Update storage if requested or if already present and no local changes are pending
    if (store || (storage.records[recordId] && !storage.syncQueues[recordId])) {
      storage.recordsStorage[recordId] = data
    }

    return data
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

  /**
   * Keep store in sync with storage
   */
  watch(() => record.record_id && storage.records[record.record_id], async () => {
    if (!record.record_id) return

    if (storage.syncQueues[record.record_id]?.operations.length || storage.records[record.record_id]?.updated_at > record.updated_at) {
      await ready(record.record_id)
    }
  })

  return {
    // current record
    record,
    // computed
    bounds,
    exists,
    hasFeatures,
    isSetup,
    // current record methods
    update,
    updateInfo,
    // store methods
    $reset,
    ready,
    duplicate,
    getRecord,
  }
})
