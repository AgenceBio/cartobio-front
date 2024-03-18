import { afterEach, describe, it, expect, vi } from "vitest"
import { flushPromises } from '@vue/test-utils'
import { useFeaturesStore } from "./features.js"
import { useFeaturesSetsStore } from "./features-sets.js"
import { usePermissions } from "./permissions.js"
import { RuleSet } from "./features-sets.js"
import { ANNOTATIONS } from "@/referentiels/ab.js"
import { createTestingPinia } from "@pinia/testing"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const store = useFeaturesStore(pinia)
const permissions = usePermissions(pinia)
const featuresSets = useFeaturesSetsStore(pinia)

afterEach(() => {
  store.$reset()
  featuresSets.$reset()
  permissions.$reset()
})

const features = [
  { id: "1", properties: { }},
  { id: "2", properties: { cultures: [ { TYPE: 'AGR', CPF: '' } ] }},
  { id: "3", properties: { cultures: [ { CPF: '01.23.11,01.23.12,01.23.13,01.23.14,01.23.19' } ] }},
  { id: "4", properties: { NUMERO_I: '1', NUMERO_P: '2', cultures: [ { CPF: '01.13.42' } ] }},
  { id: "5", properties: { NOM: 'test', cultures: [ { CPF: '01.13.42' } ], conversion_niveau: 'C1' }},
  { id: "6", properties: { NOM: 'test', cultures: [ { CPF: '01.13.42' } ], conversion_niveau: 'AB?' }},
  { id: "7", properties: { NOM: 'test', cultures: [ { CPF: '01.13.42' } ], conversion_niveau: 'AB' }},
  { id: "8", geometry: { coordinates: [] }, properties: { NOM: 'test', cultures: [ { CPF: '01.13.42' } ], conversion_niveau: 'C1', engagement_date: '2023-04-23' }},
]

describe('results', () => {
  it('computes an introspection of the featureCollection as an operator', () => {
    store.setAll(features)

    expect(featuresSets.sets).toMatchObject(new Map([
      [
        RuleSet.NAMELESS,
        {
          count: 3,
          details: [['1', true], ['2', true], ['3', true]],
          errorMessage: 'Il manque un nom',
          featureIds: ['1', '2', '3'],
          property: 'name',
          required: true
        }
      ],

      [
        RuleSet.CULTURE_MISSING,
        {
          count: 1,
          details: [['1', true]],
          errorMessage: 'Il manque un type de culture',
          featureIds: ['1'],
          property: 'cultures',
          required: true
        }
      ],

      [
        RuleSet.CULTURE_UNSURE,
        {
          count: 2,
          details: [['2', [0, true]], ['3', [0, true]]],
          errorMessage: 'La culture est à préciser',
          featureIds: ['2', '3'],
          property: 'cultures',
          required: true
        }
      ],

      [
        RuleSet.CONVERSION_LEVEL_MISSING,
        {
          count: 4,
          details: [['1', true], ['2', true], ['3', true], ['4', true]],
          errorMessage: 'Il manque un niveau de conversion',
          featureIds: ['1', '2', '3', '4'],
          property: 'conversion_niveau',
          required: false
        }
      ],

      [
        RuleSet.CONVERSION_LEVEL_UNSURE,
        {
          count: 1,
          details: [['6', true]],
          errorMessage: "Le niveau de conversion en agriculture biologique a besoin d'être précisé",
          featureIds: ['6'],
          property: 'conversion_niveau',
          required: false
        }
      ],

      [
        RuleSet.ENGAGEMENT_DATE_MISSING,
        {
          count: 1,
          details: [['5', true]],
          errorMessage: "Il manque une date de début de conversion",
          featureIds: ['5'],
          property: 'engagement_date',
          required: false
        }
      ],

      [
        RuleSet.GEOMETRY_MISSING,
        {
          count: 8,
          details: [['1', true], ['2', true], ['3', true], ['4', true], ['5', true], ['6', true], ['7', true], ['8', true]],
          errorMessage: 'Il manque des coordonnées géométriques',
          featureIds: ['1', '2', '3', '4', '5', '6', '7', '8'],
          property: '_geometry',
          required: false
        }
      ]
    ]))
  })

  it('computes an introspection of the featureCollection as an OC', () => {
    store.setAll(features)

    permissions.isOc = true
    expect(featuresSets.sets).toSatisfy((map) => map.get(RuleSet.CONVERSION_LEVEL_UNSURE).required === true)

    permissions.isOc = false
    expect(featuresSets.sets).toSatisfy((map) => map.get(RuleSet.CONVERSION_LEVEL_UNSURE).required === false)
  })
})

describe('hasRequiredSets', () => {
  it('tells some required checks are not fulfilled', () => {
    store.setAll(features)

    expect(featuresSets.hasRequiredSets).toBe(true)
  })
})

describe('byFeature()', () => {
  it('returns results tied to a featureId', () => {
    store.setAll(features)

    expect(featuresSets.byFeature('6')).toMatchObject(new Map([
      [
        RuleSet.CONVERSION_LEVEL_UNSURE,
        {
          count: 1,
          errorMessage: "Le niveau de conversion en agriculture biologique a besoin d'être précisé",
          featureIds: ['6'],
          property: 'conversion_niveau',
          required: false
        }
      ],

      [
        RuleSet.GEOMETRY_MISSING,
        {
          count: 1,
          errorMessage: 'Il manque des coordonnées géométriques',
          featureIds: ['6'],
          property: '_geometry',
          required: false
        }
      ]
    ]))
  })

  it('returns nothing if a feature does not exist', () => {
    store.setAll(features)

    expect(featuresSets.byFeature('ZZZ')).toMatchObject(new Map())
  })
})

describe('byFeatureProperty()', () => {
  it('returns only the relevant property checks', () => {
    store.setAll(features)

    expect(featuresSets.byFeatureProperty('6', 'conversion_niveau')).toMatchObject(new Map([
      [
        RuleSet.CONVERSION_LEVEL_UNSURE,
        {
          count: 1,
          errorMessage: "Le niveau de conversion en agriculture biologique a besoin d'être précisé",
          featureIds: ['6'],
          property: 'conversion_niveau',
          required: false
        }
      ]
    ]))
  })
})

describe('byFeatureDetail()', () => {
  it('returns only the relevant property checks', () => {
    store.setAll(features)

    expect(featuresSets.byFeatureDetail('2', 0)).toMatchObject(new Map([
      [
        RuleSet.CULTURE_UNSURE,
        {
          count: 1,
          details: [['2', [0, true]]],
          errorMessage: "La culture est à préciser",
          featureIds: ['2'],
          property: 'cultures',
          required: true
        }
      ],
    ]))
  })

  it('returns an empty map if no details could be found', () => {
    store.setAll(features)

    expect(featuresSets.byFeatureDetail('1', 0)).toMatchObject(new Map())
  })
})

describe('watch/annotations', () => {
  it('should untoggle an active filter when orphan', async () => {
    store.setAll(features)

    store.updateMatchingFeatures([{ id: '1', properties: {
      annotations: [{ id: 1, code: ANNOTATIONS.SURVEYED }]
    }}])

    const id = [RuleSet.ANNOTATED, ANNOTATIONS.SURVEYED].join('_')

    featuresSets.toggle(id)

    expect(featuresSets.isToggled(id)).toEqual(true)
    expect(featuresSets.hits).toHaveLength(1)

    store.updateMatchingFeatures([{ id: '1', properties: {
      annotations: []
    }}])

    await flushPromises()

    expect(featuresSets.hits).toHaveLength(features.length)
    expect(featuresSets.isToggled(id)).toEqual(false)
  })
})
