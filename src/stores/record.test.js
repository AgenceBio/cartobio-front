import { afterEach, describe, it, expect, vi } from "vitest"
import { useFeaturesStore } from "./features.js"
import { useOperatorStore } from "./operator.js"
import { useRecordStore } from "./record.js"
import { createTestingPinia } from "@pinia/testing"
import record from '@/utils/__fixtures__/record-with-features.json' assert { type: 'json' }
import operator from '@/utils/__fixtures__/operator.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const featuresStore = useFeaturesStore(pinia)
const store = useRecordStore(pinia)
const operatorStore = useOperatorStore(pinia)

afterEach(() => store.$reset())

describe('exists', () => {
  it('does not exist by default', () => {
    expect(store.exists).toEqual(false)
  })

  it('requires a record_id to be considered as existing', () => {
    store.update({})
    expect(store.exists).toEqual(false)

    store.update(record)
    expect(store.exists).toEqual(true)
  })
})

describe('isSetup', () => {
  it('does not exist by default', () => {
    expect(store.isSetup).toEqual(false)
  })

  it('is not setup with solely a recordId', () => {
    store.update({ record_id: 1 })
    expect(store.isSetup).toEqual(false)
  })

  it('is okay with a manual setup', () => {
    store.update({ record_id: 1, metadata: { source: '' } })
    expect(store.isSetup).toEqual(true)
  })

  it('requires a record_id and an import source', () => {
    store.update(record)
    expect(store.isSetup).toEqual(true)
  })
})

describe('bounds', () => {
  it('returns a workeable bbox (features win over operator locations)', () => {
    store.update(record)
    const expectation = [2.825121146516608, 44.260111501833876, 6.078270281232933, 47.68983218066847]

    expect(store.bounds).toEqual(expectation)
  })

  it('returns a workeable bbox (features win over no operator locations)', () => {
    store.update({ ...record, operator: { ...record.operator, adressesOperateurs: [] }})
    const expectation = [2.825121146516608, 44.260111501833876, 6.078270281232933, 47.68983218066847]

    expect(store.bounds).toEqual(expectation)
  })

  it('returns a workeable bbox (operator locations win because no features)', () => {
    operatorStore.operator = operator
    store.update({ ...record, parcelles: { type: 'FeatureCollection', features: [] } })
    const expectation = [4.5885, 45.470757, 4.63488839, 45.47151]

    expect(store.bounds).toEqual(expectation)
  })

  it('returns an empty array when no locations are found', () => {
    operatorStore.operator = {}
    expect(store.bounds).toEqual([])
  })
})


describe('update', () => {
  it('has a blank slate by default', () => {
    expect(store.record).toHaveProperty('record_id', null)
    expect(store.record).toHaveProperty('audit_history', [])
  })

  it('adds only known keys to the store', () => {
    store.update({ ...record, unknownKey: true })
    expect(store.record).toHaveProperty('record_id', record.record_id)
    expect(store.record).not.toHaveProperty('unknownKey')
  })

  it('maintains existing data if not updated', () => {
    store.update(record)
    store.update({ record_id: 'newId' })
    expect(store.record).toHaveProperty('certification_state', 'OPERATOR_DRAFT')
    expect(store.record).toHaveProperty('record_id', 'newId')
  })

  it('cascades the feature store updates', () => {
    store.update(record)
    expect(featuresStore.all).toHaveLength(4)
  })

  it('resets the feature store as well', () => {
    store.update(record)
    store.$reset()
    expect(featuresStore.all).toHaveLength(0)
  })
})
