import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { useLocalStorage, useOnline } from "@vueuse/core"
import { getOperator, getRecordsSummary } from "@/stores/operator.js"
import { apiClient, createOperatorRecord } from "@/cartobio-api.js"
import { useRecordStore } from "@/stores/record.js"

/**
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator} AgenceBioNormalizedOperator
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecordSummary} NormalizedRecordSummary
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureProperties} CartoBioFeatureProperties
 * @typedef {import('geojson').Feature} Feature
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 */

class SyncQueue {
  /**
   * @type {SyncOperation[]}
   */
  operations

  /**
   * @type Date
   */
  ifUnmodifiedSince

  /**
   * @param {SyncOperation[]} operations
   * @param {Date} [ifUnmodifiedSince]
   */
  constructor(operations, ifUnmodifiedSince = new Date()) {
    this.operations = operations
    this.ifUnmodifiedSince = ifUnmodifiedSince
  }

  /**
   * @param recordId
   * @param {Date} unmodifiedSince
   * @return {Promise<SyncOperation>|null}
   */
  async syncNext(recordId, unmodifiedSince) {
    if (this.operations.length === 0) return null

    /**
     * @type {{headers: AxiosHeaders}}
     */
    const config = { headers: {
        'If-Unmodified-Since': unmodifiedSince.toUTCString()
    }}
    const op = this.operations[0]
    switch (op.action) {
      case SyncOperation.ACTIONS.RECORD_INFO:
        await apiClient.patch(`/v2/audits/${recordId}`, op.payload, config)
        break
      case SyncOperation.ACTIONS.DELETE_FEATURE:
        await apiClient.delete(`/v2/audits/${recordId}/parcelles/${op.featureId}`, { data: op.payload, ...config })
        break
      case SyncOperation.ACTIONS.UPDATE_FEATURE:
        await apiClient.patch(`/v2/audits/${recordId}/parcelles/${op.featureId}`, op.payload, config)
        break
      case SyncOperation.ACTIONS.UPDATE_COLLECTION:
        await apiClient.patch(`/v2/audits/${recordId}/parcelles`, op.payload, config)
        break
    }

    return this.operations.shift()
  }

  /**
   * @param recordId
   */
  async sync(recordId) {
    while (await this.syncNext(recordId, this.ifUnmodifiedSince)) {
      this.ifUnmodifiedSince = new Date()
    }
  }
}

/**
 * @typedef {Partial<NormalizedRecord>|Partial<FeatureCollection<Polygon, Partial<CartoBioFeatureProperties>>>|Partial<Feature<Polygon, Partial<CartoBioFeatureProperties>>>|{reason: string}} SyncOperationPayload
 */

/**
 * Every modification to the store must be queued as a sync operation.
 *
 * @typedef {Object} SyncOperation
 * @property {ACTIONS} action
 * @property {SyncOperationPayload} payload
 * @property {string} [featureId]
 */
export class SyncOperation {
  action;
  payload;
  featureId = null;
  /**
   * @type {Date}
   */
  ifUnmodifiedSince;

  /**
   * @enum {String}
   */
  static ACTIONS = {
    RECORD_INFO: 'recordInfo',
    DELETE_FEATURE: 'deleteFeature',
    UPDATE_FEATURE: 'updateFeature',
    UPDATE_COLLECTION: 'updateCollection'
  }

  /**
   * @param {ACTIONS} action
   * @param {SyncOperationPayload} payload
   * @param {string} [featureId]
   */
  constructor(action, payload, featureId = null) {
    this.action = action
    this.payload = payload
    this.featureId = featureId
  }

  /**
   * @param {NormalizedRecord} record
   */
  apply(record) {
    const result = JSON.parse(JSON.stringify(record))
    switch (this.action) {
      case SyncOperation.ACTIONS.RECORD_INFO:
        Object.assign(result, this.payload)
        return result
      case SyncOperation.ACTIONS.UPDATE_COLLECTION: {
        const features = this.payload.features
        for (let i = 0; i < features.length; i++) {
          Object.assign(
              result.parcelles.features.find(f => f.id === features[i].id).properties,
              features[i].properties
          )
        }
        result.parcelles.features = result.parcelles.features.filter(f => features.find(f2 => f2.id === f.id))
        return result
      }
      case SyncOperation.ACTIONS.DELETE_FEATURE:
        result.parcelles.features = result.parcelles.features.filter(f => f.id !== this.featureId)
        return result
      case SyncOperation.ACTIONS.UPDATE_FEATURE:
        Object.assign(
            result.parcelles.features.find(f => f.id === this.featureId).properties,
            this.payload.properties
        )
        return result
    }
  }
}

export const useCartoBioStorage = defineStore('storage', () => {
  const recordStore = useRecordStore()
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
   * @type {Ref<UnwrapRef<Set<string>>>} - list of record ids that have conflicts
   */
  const conflicts = ref(/** @type Set<string> */new Set())

  /**
   * @type {RemovableRef<{
   *   string: SyncQueue
   * }>}
   */
  const syncQueues = useLocalStorage(
    'syncQueue',
    /** @type {{string: SyncQueue}} */{},
    {
      serializer: {
        read: (s) => Object.fromEntries(
          Object.entries(JSON.parse(s)).map(
            ([recordId, queue]) => [recordId, new SyncQueue(
              queue.operations.map(op => new SyncOperation(op.action, op.payload, op.featureId)),
              new Date(queue.ifUnmodifiedSince)
            )]
          )
        ),
        write: JSON.stringify
      }
    }
  )

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
      const record = await recordStore.getRecord(recordId, true)
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
   * @param recordId
   * @return {[NormalizedRecord, boolean]} - the record and a boolean indicating if there are queued operations for this record
   */
  function getRecordWithQueuedOps (recordId) {
    let record = recordsStorage.value[recordId]

    if (!syncQueues.value[recordId]) return [record, false]

    const changes = syncQueues.value[recordId].operations

    for (let i = 0; i < changes.length; i++) {
      record = changes[i].apply(record)
    }

    return [record, true]
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

  /**
   * Sync logic
   */
  const online = useOnline()

  /**
   * @param {string} recordId
   * @param {SyncOperation} sync
   */
  function addSyncOperation (recordId, sync) {
    syncQueues.value[recordId] = syncQueues.value[recordId] || new SyncQueue([])
    syncQueues.value[recordId].operations.push(sync)
  }

  /**
   * Resolve a conflict by either duplicating the record
   * or removing operations on deleted features before applying operations on new version.
   * @param {UUID} recordId
   * @param {boolean} duplicate
   * @return {Promise<void>}
   */
  async function resolveConflict (recordId, duplicate = true) {
    const record = recordsStorage.value[recordId]

    if (duplicate) {
      const newRecord = await createOperatorRecord(record.numerobio, {
        versionName: `${record.version_name} (copie hors-ligne)`,
        geojson: record.parcelles,
        metadata: {
          provenance: window.location.host,
          source: 'Copie lors de la résolution de conflits',
          copy_of: record.record_id
        }
      })
      await addRecord(newRecord.record_id)
      syncQueues.value[newRecord.record_id] = syncQueues.value[recordId]
      syncQueues.value[newRecord.record_id].ifUnmodifiedSince = new Date()
      delete syncQueues.value[recordId]
    } else {
      // we remove operations on deleted features
      const newRecord = await recordStore.getRecord(recordId, true)
      syncQueues.value[recordId].operations = syncQueues.value[recordId].operations.filter(
          op => newRecord.parcelles.features.find(f => f.id === op.featureId)
      )
      syncQueues.value[recordId].ifUnmodifiedSince = new Date()
    }
    conflicts.value.delete(recordId)
  }

  const syncing = ref(false)
  watch(() => [online, syncQueues], async ([, syncQueues]) => {
    if (!navigator.onLine) return
    if (syncing.value) return
    syncing.value = true

    try {
      for (const [recordId, queue] of Object.entries(syncQueues.value)) {
        try {
          await queue.sync(recordId)
          delete syncQueues.value[recordId]
          if (records.value[recordId]) {
            await addRecord(recordId) // update storage
          }
        } catch (e) {
          if (e.response?.status === 412 || e.response?.status === 404) {
            conflicts.value.add(recordId)
          }

          throw e
        }
      }
    } finally {
      syncing.value = false
    }
  }, { deep: true })


  return {
    // storage ref
    operatorsStorage,
    recordsStorage,
    syncQueues,
    // read-only refs
    operators,
    records,
    online,
    // state ref
    conflicts,
    // store methods
    addRecord,
    getRecordWithQueuedOps,
    clearRecord,
    addSyncOperation,
    resolveConflict,
  }
})
