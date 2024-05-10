import { describe, expect, it, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { useCartoBioStorage } from "@/stores/storage.js"
import record from '@/components/Features/__fixtures__/record-with-features.json' assert { type: 'json' }
import operator from '@/components/Features/__fixtures__/operator.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })

vi.mock('@/stores/record.js', () => ({
  getRecord: vi.fn(() => Promise.resolve(record))
}))

vi.mock('@/stores/operator.js', () => ({
  getOperator: vi.fn(() => Promise.resolve(operator)),
  getRecordsSummary: vi.fn(() => Promise.resolve([]))
}))


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
})
