import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
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
    let newRecord
    if ((storage.syncQueues[recordId] || !navigator.onLine) && storage.records[recordId]) {
      newRecord = storage.records[recordId]
    } else {
      newRecord = await getRecord(recordId)
    }

    await operatorStore.ready(newRecord.numerobio)
    if (record.record_id !== recordId) $reset()
    update(newRecord)
  }

  /**
   * @param id
   * @return {Promise<NormalizedRecord>}
   */
  async function duplicate(id) {
    const uuidRegex = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    const recordSummary = operatorStore.records.find(record => record.record_id === id)
    const record = await getRecord(id)

    const newRecord = await createOperatorRecord(operatorStore.operator.numeroBio, {
      version_name: `Copie de ${record.version_name}`,
      parcelles: {
        ...record.parcelles,
        features: record.parcelles.features.map((p) => ({
          ...p,
          properties: {
            ...p.properties,
            cultures: p.properties.cultures.map((c) => (
              {
                ...c,
                id: c.id && uuidRegex.test(c.id) ? c.id : crypto.randomUUID()
              }))
          }
        })),
      },
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
  async function getRecord (recordId, store = false) {
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
