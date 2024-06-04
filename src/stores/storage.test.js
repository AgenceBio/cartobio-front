import { beforeEach, describe, expect, it, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { SyncOperation, useCartoBioStorage } from "@/stores/storage.js"
import record from '@/components/Features/__fixtures__/record-with-features.json' assert { type: 'json' }
import operator from '@/components/Features/__fixtures__/operator.json' assert { type: 'json' }
import axios from "axios"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })


beforeEach(() => {
  axios.__createMock.get.mockResolvedValue({ data: record })
  axios.__createMock.patch.mockResolvedValue({ data: record })
  axios.__createMock.delete.mockResolvedValue({ data: record })
})

vi.mock('@/stores/operator.js', async (importOriginal) => {
  const original = await importOriginal()

  return ({
    ...original,
    getOperator: vi.fn(() => Promise.resolve(operator)),
    getRecordsSummary: vi.fn(() => Promise.resolve([]))
  })
})


const storage = useCartoBioStorage(pinia)

describe('storage', () => {
  it('should be empty by default', () => {
    expect(storage.operators).toEqual({})
    expect(storage.records).toEqual({})
  })

  it('should add a record and the corresponding operator', async () => {
    await storage.addRecord(record.record_id)

    expect(storage.records).toHaveProperty(record.record_id)
    expect(storage.operators).toHaveProperty(record.numerobio)
  })

  it('should clear a record and the corresponding operator', async () => {
    await storage.addRecord(record.record_id)
    storage.clearRecord(record.record_id)

    expect(storage.records).not.toHaveProperty(record.record_id)
    expect(storage.operators).not.toHaveProperty(record.numerobio)
  })

  describe('getRecordWithQueuedOps', () => {
    it('should return the record with deleted feature operations applied', async () => {
      const recordId = record.record_id
      await storage.addRecord(recordId)
      storage.addSyncOperation(recordId, new SyncOperation(
          SyncOperation.ACTIONS.DELETE_FEATURE,
          { reason: 'error' },
          "1"
      ))

      expect(storage.records[recordId].parcelles.features.length).toBe(3)
    })

    it('should return the record with feature update operations applied', async () => {
      const recordId = record.record_id
      await storage.addRecord(recordId)
      storage.addSyncOperation(recordId, new SyncOperation(
          SyncOperation.ACTIONS.UPDATE_FEATURE,
          { type: 'Feature', properties: { NOM: 'Nom test' } },
          "1"
      ))

      expect(storage.records[recordId].parcelles.features[0].properties.NOM).toEqual('Nom test')
    })

    it('should return the record with record info operations applied', async () => {
      const recordId = record.record_id
      await storage.addRecord(recordId)
      storage.addSyncOperation(recordId, new SyncOperation(
          SyncOperation.ACTIONS.RECORD_INFO,
          { version_name: 'Version test au nom changé' }
      ))

      expect(
        storage.records[recordId].version_name
      ).toBe('Version test au nom changé')
    })

    it('should return the record with feature collection operations applied', async () => {
      const recordId = record.record_id
      await storage.addRecord(recordId)
      storage.addSyncOperation(recordId, new SyncOperation(
          SyncOperation.ACTIONS.UPDATE_COLLECTION,
          {
            type: 'FeatureCollection',
            features: [
              { id: "1", properties: { conversion_niveau: 'CONV' } },
              { id: "2", properties: { conversion_niveau: 'CONV' } },
              { id: "3", properties: { conversion_niveau: 'CONV' } }
            ]
          }
      ))

    expect(
      storage.records[recordId].parcelles.features.map(f => f.properties.conversion_niveau)
    ).toStrictEqual(['CONV', 'CONV', 'CONV', 'AB'])
    })
  })
})
