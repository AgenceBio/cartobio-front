import { afterEach, describe, it, expect, vi } from "vitest"
import { useFeaturesStore } from "./features.js"
import { createTestingPinia } from "@pinia/testing"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const features = useFeaturesStore(pinia)

const sampleFeatures = [
  { id: 1, properties: { id: 1, conversion_niveau: 'AB' }},
  { id: 2, properties: { id: 2, conversion_niveau: 'AB' }}
]

describe('states', () => {
  afterEach(() => features.$reset())

  it('should return an accurate collection', () => {
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

  it('should keep track of active/hovered feature', () => {
    features.setAll(sampleFeatures)

    expect(features.activeFeature).toBeNull()
    expect(features.hoveredFeature).toBeNull()

    features.activeId = 2
    expect(features.activeFeature).toEqual(sampleFeatures.at(1))

    features.hoveredId = 1
    expect(features.hoveredFeature).toEqual(sampleFeatures.at(0))
  })
})

describe('hasFeatures()', () => {
  afterEach(() => features.$reset())

  it('should be empty', () => {
    expect(features.hasFeatures).toEqual(false)
  })

  it('should be truthy with one feature', () => {
    features.setAll(sampleFeatures)

    expect(features.hasFeatures).toEqual(true)
  })
})

describe('getFeatureById()', () => {
  afterEach(() => features.$reset())

  it('should return nothing', () => {
    expect(features.getFeatureById(1)).toEqual(undefined)
  })

  it('should be truthy with one feature', () => {
    features.setAll(sampleFeatures)

    expect(features.getFeatureById(1)).toHaveProperty('id', 1)
  })
})

describe('toggle*Selected()', () => {
  afterEach(() => features.$reset())

  it('should have no selected features', () => {
    expect(features.selectedFeatures).toEqual([])
  })

  it('should return only the selected feature 1, and untoggle it afterwards', () => {
    features.setAll(sampleFeatures)
    features.toggleSingleSelected(1)

    expect(features.selectedFeatures).toHaveProperty('0.id', 1)
    expect(features.selectedFeatures).toHaveLength(1)

    features.toggleSingleSelected(1)
    expect(features.selectedFeatures).toEqual([])
  })

  it('should return only the selected feature 1, and untoggle it afterwards', () => {
    features.setAll(sampleFeatures)
    features.toggleAllSelected()

    expect(features.selectedFeatures).toHaveProperty('0.id', 1)
    expect(features.selectedFeatures).toHaveProperty('1.id', 2)
    expect(features.selectedFeatures).toHaveLength(2)

    features.toggleAllSelected()
    expect(features.selectedFeatures).toEqual([])
  })
})

describe('updateMatchingFeatures()', () => {
  afterEach(() => features.$reset())

  it('should do nothing', () => {
    features.updateMatchingFeatures([{ id: 1, properties: { CPF: '01.21.12' }}])
    expect(features.selectedFeatures).toEqual([])
  })

  it('should patch existing features', () => {
    features.setAll(sampleFeatures)
    features.updateMatchingFeatures([{ id: 1, properties: { CPF: '01.21.12' }}])
    expect(features.collection).toHaveProperty('features.0.properties.CPF', '01.21.12')
    expect(features.collection).toHaveProperty('features.0.properties.conversion_niveau', 'AB')
  })
})
