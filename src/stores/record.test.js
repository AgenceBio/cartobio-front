import { afterEach, describe, it, expect, vi } from "vitest"
import { useFeaturesStore, useRecordStore } from "./index.js"
import { createTestingPinia } from "@pinia/testing"
import record from '@/components/Features/__fixtures__/record-with-features.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const featuresStore = useFeaturesStore(pinia)
const store = useRecordStore(pinia)

afterEach(() => store.reset())

describe('exists', () => {
  it('does not exist by default', () => {
    expect(store.exists).toEqual(false)
  })

  it('requires a record_id to be considered as existing', () => {
    store.update({ operator: { nom: 'test', numeroBio: '34857' }})
    expect(store.exists).toEqual(false)

    store.update(record)
    expect(store.exists).toEqual(true)
  })
})

describe('isSetup', () => {
  it('does not exist by default', () => {
    expect(store.isSetup).toEqual(false)
  })

  it('requires a record_id and an import source ', () => {
    store.update({ record_id: 1 })
    expect(store.isSetup).toEqual(false)

    store.update(record)
    expect(store.isSetup).toEqual(true)
  })
})

describe('replace', () => {
  it('does not keep track of previous data, even when it is from the same record/operator', () => {
    store.update(record)
    expect(store.record).toHaveProperty('record_id', '054f0d70-c3da-448f-823e-81fcf7c2bf6e')
    expect(store.record).toHaveProperty('certification_state', 'OPERATOR_DRAFT')

    store.replace({ record_id: 'newId' })
    expect(store.record).toHaveProperty('record_id', 'newId')
    expect(store.record).toHaveProperty('certification_state', null)
    expect(store.record).toHaveProperty('operator', {})
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
    expect(store.record).toHaveProperty('operator', { nom: 'test', numeroBio: '34857' })
  })

  it('maintains existing data if not updated', () => {
    store.update(record)
    store.update({ record_id: 'newId' })
    console.log(record)
    expect(store.record).toHaveProperty('certification_state', 'OPERATOR_DRAFT')
    expect(store.record).toHaveProperty('record_id', 'newId')
    expect(store.record).toHaveProperty('operator', { nom: 'test', numeroBio: '34857' })
  })

  it('cascades the feature store updates', () => {
    store.update(record)
    expect(featuresStore.all).toHaveLength(3)
  })

  it('resets the feature store as well', () => {
    store.update(record)
    store.reset()
    expect(featuresStore.all).toHaveLength(0)
  })
})
