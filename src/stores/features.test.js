import { afterEach, beforeEach, describe, it, expect, vi } from "vitest"
import { useFeaturesStore } from "./features.js"
import { createTestingPinia } from "@pinia/testing"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const features = useFeaturesStore(pinia)

const sampleFeatures = [
  { id: '1', properties: { id: '1', conversion_niveau: 'AB' }},
  { id: '2', properties: { id: '2', conversion_niveau: 'AB' }}
]

afterEach(() => features.$reset())

describe('states', () => {
  it('should collect all new features', () => {
    expect(features.collection).toEqual({
      type: 'FeatureCollection',
      features: []
    })

    features.setAll(sampleFeatures)
    expect(features.collection).toEqual({
      type: 'FeatureCollection',
      features: sampleFeatures
    })
  })

  it('should evict removed feature', () => {
    features.setAll(sampleFeatures)
    // we remove one feature
    features.setAll([sampleFeatures.at(0)])

    expect(features.collection).toEqual({
      type: 'FeatureCollection',
      features: [sampleFeatures.at(0)]
    })
  })

  it('should keep track of active/hovered feature', () => {
    features.setAll(sampleFeatures)

    expect(features.activeFeature).toBeNull()
    expect(features.hoveredFeature).toBeNull()

    features.activeId = '2'
    expect(features.activeFeature).toEqual(sampleFeatures.at(1))

    features.hoveredId = '1'
    expect(features.hoveredFeature).toEqual(sampleFeatures.at(0))
  })
})

describe('hasFeatures()', () => {
  it('should be empty', () => {
    expect(features.hasFeatures).toEqual(false)
  })

  it('should be truthy with one feature', () => {
    features.setAll(sampleFeatures)

    expect(features.hasFeatures).toEqual(true)
  })
})

describe('getFeatureById()', () => {
  it('should return nothing', () => {
    expect(features.getFeatureById(1)).toEqual(undefined)
  })

  it('should be truthy with one feature', () => {
    features.setAll(sampleFeatures)

    expect(features.getFeatureById(1)).toHaveProperty('id', '1')
  })
})

describe('select/unselect', () => {
  beforeEach(() => features.setAll(sampleFeatures))

  it('should select 1, then 2 without duplicates', () => {
    expect(features.selectedFeatures).toEqual([])

    features.select(1)
    expect(features.selectedIds).toEqual(['1'])

    features.select(1, 2)
    expect(features.selectedIds).toEqual(['1', '2'])
  })

  it('should unselect 1', () => {
    features.toggleAllSelected()
    features.unselect(1)
    expect(features.selectedIds).toEqual(['2'])

    features.unselect(1)
    expect(features.selectedIds).toEqual(['2'])
  })
})

describe('toggle*Selected()', () => {
  afterEach(() => features.$reset())

  it('should have no selected features', () => {
    expect(features.selectedIds).toEqual([])
  })

  it('should return only the selected feature 1, and untoggle it afterwards', () => {
    features.setAll(sampleFeatures)
    features.toggleSingleSelected(1)

    expect(features.selectedFeatures).toHaveProperty('0.id', '1')
    expect(features.selectedFeatures).toHaveLength(1)

    features.toggleSingleSelected(1)
    expect(features.selectedFeatures).toEqual([])
  })

  it('should return only the selected feature 1, and untoggle it afterwards', () => {
    features.setAll(sampleFeatures)
    features.toggleAllSelected()

    expect(features.selectedFeatures).toHaveProperty('0.id', '1')
    expect(features.selectedFeatures).toHaveProperty('1.id', '2')
    expect(features.selectedFeatures).toHaveLength(2)

    features.toggleAllSelected()
    expect(features.selectedFeatures).toEqual([])
  })
})

describe('setCandidate()', () => {
  it('should merge data into a temporary collection', () => {
    features.setAll(sampleFeatures)
    features.setCandidate([{ id: '1', properties: { CPF: '01.21.12' }}])

    expect(features.isDirty).toEqual(true)
    expect(features.all.find(({ id }) => id === '1')).not.toHaveProperty('properties.CPF')
    expect(features.allCandidate.find(({ id }) => id === '1')).toHaveProperty('properties.CPF', '01.21.12')
  })

  it('should commit candidates into the mainstream collection', () => {
    features.setAll(sampleFeatures)
    features.setCandidate([{ id: '1', properties: { CPF: '01.21.12' }}])
    features.commitCandidate()

    expect(features.isDirty).toEqual(false)
    expect(features.all).toEqual(features.allCandidate)
  })
})

describe('updateMatchingFeatures()', () => {
  it('should do nothing', () => {
    features.updateMatchingFeatures([{ id: '1', properties: { CPF: '01.21.12' }}])
    expect(features.selectedFeatures).toEqual([])
  })

  it('should patch existing features', () => {
    features.setAll(sampleFeatures)
    features.updateMatchingFeatures([{ id: '1', properties: { CPF: '01.21.12' }}])
    expect(features.collection).toHaveProperty('features.0.properties.CPF', '01.21.12')
    expect(features.collection).toHaveProperty('features.0.properties.conversion_niveau', 'AB')
  })
})
