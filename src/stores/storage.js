import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useLocalStorage, useOnline } from "@vueuse/core";
import { apiClient, createOperatorRecord } from "@/cartobio-api.js";
import { legalProjectionSurface } from "@/utils/features.js";

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
  operations;

  /**
   * @type Date
   */
  ifUnmodifiedSince;

  /**
   * @param {SyncOperation[]} operations
   * @param {Date} [ifUnmodifiedSince]
   */
  constructor(operations, ifUnmodifiedSince = new Date()) {
    this.operations = operations;
    this.ifUnmodifiedSince = ifUnmodifiedSince;
  }

  mergeAuditDateOperations() {
    this.operations = this.operations.reduce((acc, op) => {
      if (op.action === SyncOperation.ACTIONS.RECORD_INFO && "audit_date" in op.payload) {
        const firstAuditDateOp = acc.find(
          (op) => op.action === SyncOperation.ACTIONS.RECORD_INFO && "audit_date" in op.payload,
        );
        if (firstAuditDateOp) {
          firstAuditDateOp.payload.audit_date = op.payload.audit_date;
        }
      }

      return acc.concat([op]);
    }, []);
  }

  /**
   * @param recordId
   * @param {Date} unmodifiedSince
   * @return {Date|null} - the new unmodifiedSince date or null if there are no more operations
   */
  async syncNext(recordId, unmodifiedSince) {
    if (this.operations.length === 0) return null;

    /**
     * @type {{headers: AxiosHeaders}}
     */
    const config = {
      headers: {
        "If-Unmodified-Since": unmodifiedSince.toUTCString(),
      },
    };
    const op = this.operations[0];
    let result;
    switch (op.action) {
      case SyncOperation.ACTIONS.RECORD_INFO:
        result = await apiClient.patch(`/v2/audits/${recordId}`, op.payload, config);
        break;
      case SyncOperation.ACTIONS.DELETE_FEATURE:
        result = await apiClient.delete(`/v2/audits/${recordId}/parcelles/${op.featureId}`, {
          data: op.payload,
          ...config,
        });
        break;
      case SyncOperation.ACTIONS.UPDATE_FEATURE:
        result = await apiClient.patch(`/v2/audits/${recordId}/parcelles/${op.featureId}`, op.payload, config);
        break;
      case SyncOperation.ACTIONS.UPDATE_COLLECTION:
        result = await apiClient.patch(`/v2/audits/${recordId}/parcelles`, op.payload, config);
        break;
    }

    this.operations.shift();
    return new Date(result.data.updated_at);
  }

  /**
   * @param recordId
   */
  async sync(recordId) {
    this.mergeAuditDateOperations();
    let updated = this.ifUnmodifiedSince;
    while (updated !== null) {
      this.ifUnmodifiedSince = updated;
      updated = await this.syncNext(recordId, this.ifUnmodifiedSince);
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
    RECORD_INFO: "recordInfo",
    DELETE_FEATURE: "deleteFeature",
    UPDATE_FEATURE: "updateFeature",
    UPDATE_COLLECTION: "updateCollection",
  };

  /**
   * @param {ACTIONS} action
   * @param {SyncOperationPayload} payload
   * @param {string} [featureId]
   */
  constructor(action, payload, featureId = null) {
    this.action = action;
    this.payload = payload;
    this.featureId = featureId;
  }

  /**
   * @param {NormalizedRecord} record
   */
  apply(record) {
    const result = JSON.parse(JSON.stringify(record));
    switch (this.action) {
      case SyncOperation.ACTIONS.RECORD_INFO:
        Object.assign(result, this.payload);
        return result;
      case SyncOperation.ACTIONS.UPDATE_COLLECTION: {
        const features = this.payload.features;
        for (let i = 0; i < features.length; i++) {
          Object.assign(
            result.parcelles.features.find((f) => f.id === features[i].id)?.properties || {},
            features[i].properties,
          );
        }
        return result;
      }
      case SyncOperation.ACTIONS.DELETE_FEATURE:
        result.parcelles.features = result.parcelles.features.filter((f) => f.id !== this.featureId);
        return result;
      case SyncOperation.ACTIONS.UPDATE_FEATURE:
        Object.assign(
          result.parcelles.features.find((f) => f.id === this.featureId)?.properties || {},
          this.payload.properties,
        );
        return result;
    }
  }
}

/**
 * @param {NormalizedRecord} record
 * @param {SyncOperation[]} changes
 * @return {NormalizedRecord} - the record and a boolean indicating if there are queued operations for this record
 */
function getRecordWithQueuedOps(record, changes) {
  for (let i = 0; i < changes.length; i++) {
    record = changes[i].apply(record);
  }

  return record;
}

export const useCartoBioStorage = defineStore("storage", () => {
  /**
   * @type {RemovableRef<{
   *   [numeroBio: string]: {
   *     operator: AgenceBioNormalizedOperator,
   *     records: NormalizedRecordSummary[]
   *   }
   * }>}
   */
  const operatorsStorage = useLocalStorage("operators", {});

  /**
   * @type {RemovableRef<{
   *   [recordId: string]: NormalizedRecord
   * }>}
   */
  const recordsStorage = useLocalStorage("records", {});

  /**
   * @type {ComputedRef<{[numeroBio: string]: {operator: AgenceBioNormalizedOperator, records: NormalizedRecordSummary[]}}>}
   */
  const operators = computed(() =>
    Object.fromEntries(
      Object.entries(operatorsStorage.value).map(([numeroBio, { operator, records: recordsSummary }]) => [
        numeroBio,
        {
          operator,
          records: recordsSummary?.map((r) => {
            if (!syncQueues.value[r.record_id]) return r;
            const updatedRecord = records.value[r.record_id];
            if (!updatedRecord) return r;

            r.version_name = updatedRecord.version_name;
            r.certification_state = updatedRecord.certification_state;
            r.audit_date = updatedRecord.audit_date;
            r.certification_date_debut = updatedRecord.certification_date_debut;
            r.certification_date_fin = updatedRecord.certification_date_fin;
            r.parcelles = updatedRecord.parcelles.features.length;
            r.surface = legalProjectionSurface(updatedRecord.parcelles.features);
            return r;
          }),
        },
      ]),
    ),
  );

  /**
   * Records with queued operations applied
   *
   * @type {ComputedRef<{[recordId: string]: NormalizedRecord}>}
   */
  const records = computed(() =>
    Object.fromEntries(
      Object.entries(recordsStorage.value).map(([id]) => [
        id,
        getRecordWithQueuedOps(recordsStorage.value[id], syncQueues.value[id]?.operations || []),
      ]),
    ),
  );

  /**
   * @type {Ref<UnwrapRef<Set<string>>>} - list of record ids that have conflicts
   */
  const conflicts = ref(/** @type Set<string> */ new Set());

  /**
   * @type {Ref<UnwrapRef<Set<string>>>} - list of record ids that have audit_date conflicts with other verions
   */
  const dateConflicts = ref(/** @type Set<string> */ new Set());

  /**
   * @type {RemovableRef<{
   *   string: SyncQueue
   * }>}
   */
  const syncQueues = useLocalStorage(
    "syncQueue",
    /** @type {{string: SyncQueue}} */ {},
    {
      serializer: {
        read: (s) =>
          Object.fromEntries(
            Object.entries(JSON.parse(s)).map(([recordId, queue]) => [
              recordId,
              new SyncQueue(
                queue.operations.map((op) => new SyncOperation(op.action, op.payload, op.featureId)),
                new Date(queue.ifUnmodifiedSince),
              ),
            ]),
          ),
        write: JSON.stringify,
      },
    },
  );

  /**
   * Clear an operator from the store.
   * @param numeroBio
   */
  function clearOperator(numeroBio) {
    delete operatorsStorage.value[numeroBio];
  }

  /**
   * Download a record for offline use.
   * @param recordId
   * @return {Promise<boolean>} - true if the record was successfully downloaded, false if the storage is full.
   */
  async function addRecord(recordId) {
    const { useRecordStore } = await import("@/stores/record.js");
    const { useOperatorStore } = await import("@/stores/operator.js");
    const operatorStore = useOperatorStore();
    try {
      const record = await useRecordStore().getRecord(recordId, true);
      await operatorStore.getOperator(record.numerobio, true);
    } catch (e) {
      if (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        return false;
      }

      throw e;
    }

    return true;
  }

  /**
   * Clear a record from the store.
   * @param recordId
   * @return {boolean} - true if the record was successfully cleared, false if it was not found.
   */
  function clearRecord(recordId) {
    const numeroBio = recordsStorage.value[recordId]?.numerobio;
    if (!numeroBio) return false;
    delete recordsStorage.value[recordId];

    if (Object.entries(recordsStorage.value).every(([, r]) => r.numerobio !== numeroBio)) {
      clearOperator(numeroBio);
    }

    return true;
  }

  /**
   * Sync logic
   */
  const online = useOnline();

  /**
   * @param {string} recordId
   * @param {SyncOperation} sync
   */
  function addSyncOperation(recordId, sync) {
    syncQueues.value[recordId] = syncQueues.value[recordId] || new SyncQueue([]);
    syncQueues.value[recordId].operations.push(sync);
  }

  /**
   * Resolve a conflict by either duplicating the record
   * or removing operations on deleted features before applying operations on new version.
   * @param {UUID} recordId
   * @param {boolean} duplicate
   * @return {Promise<void>}
   */
  async function resolveConflict(recordId, duplicate = true) {
    const record = recordsStorage.value[recordId];

    if (duplicate) {
      const newRecord = await createOperatorRecord(record.numerobio, {
        version_name: `${record.version_name} (copie hors-ligne)`,
        parcelles: record.parcelles,
        certification_state: record.certification_state,
        certification_date_debut: record.certification_date_debut,
        certification_date_fin: record.certification_date_fin,
        metadata: {
          provenance: window.location.host,
          source: "Copie lors de la résolution de conflits",
          copy_of: record.record_id,
        },
        audit_date: record.audit_date,
        audit_notes: record.audit_notes,
        audit_demandes: record.audit_demandes,
        audit_history: record.audit_history,
      });
      await addRecord(newRecord.record_id);
      syncQueues.value[newRecord.record_id] = syncQueues.value[recordId];
      syncQueues.value[newRecord.record_id].ifUnmodifiedSince = new Date();
      delete syncQueues.value[recordId];
    } else {
      // we remove operations on deleted features
      const { useRecordStore } = await import("@/stores/record.js");
      const newRecord = await useRecordStore().getRecord(recordId, true);
      syncQueues.value[recordId].operations = syncQueues.value[recordId].operations.filter(
        (op) => !op.featureId || newRecord.parcelles.features.find((f) => String(f.id) === String(op.featureId)),
      );
      syncQueues.value[recordId].ifUnmodifiedSince = new Date();
    }
    conflicts.value.delete(recordId);
  }

  const syncing = ref(false);
  async function sync() {
    const { useRecordStore } = await import("@/stores/record.js");
    const { useOperatorStore } = await import("@/stores/operator.js");
    const recordStore = useRecordStore();
    const operatorStore = useOperatorStore();

    if (!navigator.onLine) {
      if (recordStore.record.record_id) {
        return await recordStore.ready(recordStore.record.record_id);
      }
      if (operatorStore.operator.numerobio) {
        return await operatorStore.ready(operatorStore.operator.numerobio);
      }

      return;
    }
    if (syncing.value) return;
    syncing.value = true;

    try {
      for (const [recordId, queue] of Object.entries(syncQueues.value)) {
        try {
          await queue.sync(recordId);
          delete syncQueues.value[recordId];
          conflicts.value.delete(recordId);
          dateConflicts.value.delete(recordId);
          if (recordStore.record.record_id === recordId) {
            await recordStore.ready(recordId);
          } else if (records.value[recordId]) {
            await addRecord(recordId); // update storage
          } else if (operatorStore.records?.find((r) => r.record_id === recordId)) {
            await operatorStore.ready(operatorStore.records.find((r) => r.record_id === recordId).numerobio);
          }
        } catch (e) {
          if (e.response?.status === 403 || e.response?.status === 401) {
            continue;
          }

          if (
            e.response?.status === 400 &&
            e.response.data.message === "Un parcellaire ne peut pas avoir deux versions avec la même date d'audit."
          ) {
            dateConflicts.value.add(recordId);
            continue;
          }

          if (e.response?.status === 412 || e.response?.status === 404) {
            if (!recordsStorage[recordId]) {
              await addRecord(recordId);
            }
            conflicts.value.add(recordId);
            continue;
          }

          throw e;
        }
      }
    } finally {
      syncing.value = false;
    }
  }

  watch(() => [online, syncQueues], sync, { deep: true });

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
    dateConflicts,
    // store methods
    addRecord,
    clearRecord,
    addSyncOperation,
    sync,
    resolveConflict,
  };
});
