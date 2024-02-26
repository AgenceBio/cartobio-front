import { defineStore } from 'pinia'
import { computed } from 'vue'
import { fromCodeCpf } from "@agencebio/rosetta-cultures"

import { useFeaturesStore, usePermissions } from "@/stores/index.js"
import { AnnotationTags, LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from '@/referentiels/ab.js'
import { featureName } from "@/components/Features/index.js"

/** @enum {String} */
export const RuleSet = {
  NAMELESS: 'nameless',
  CULTURE_MISSING: 'without-culture',
  CULTURE_UNSURE: 'culture-unsure',
  CONVERSION_LEVEL_MISSING: 'conversion-level-missing',
  CONVERSION_LEVEL_UNSURE: 'conversion-level-unsure',
  GEOMETRY_MISSING: 'geometry-missing',
  ENGAGEMENT_DATE_MISSING: 'engagement-date-missing',
  ANNOTATED: 'annotated'
}

/**
 * Sets are used to "select" features, either by requiring some attention, some action or to refine results.
 * A "Set item" is a name/selection/validation descriptor
 * A "Set" is a set of items and a reduce function
 * A "Set result" lists the state of each item, and which features it applies to
 */

/**
 * @typedef {String} FeatureId
 */

/**
 * @typedef {Object} SetItem
 * @property {String} errorMessage
 * @property {String?} property
 * @property {Boolean} required
 * @property {Function(): FeatureId[]} select
 */

/**
 * @typedef {SetItem} SetResult
 * @property {Boolean} count
 * @property {FeatureId[]} featureIds
 */

export const useFeaturesSetsStore = defineStore('features-sets', () => {
  const featuresStore = useFeaturesStore()
  const permissions = usePermissions()

  /**
   *
   * @param {Function(Feature): Boolean} filterFn
   * @returns {FeatureId[]}
   */
  function collectIds (filterFn) {
    return featuresStore.all.filter(filterFn).map(({ id }) => id)
  }

  /** @type {Map<SetItem>} */
  const set = new Map([
    [
      RuleSet.NAMELESS,
      {
        property: 'name',
        required: true,
        errorMessage: 'Il manque un nom',
        select (name = '') {
          return collectIds(f => featureName(f, { placeholder: '' }) === name)
        }
      }
    ],
    [
      RuleSet.CULTURE_MISSING,
      {
        property: 'cultures',
        required: true,
        errorMessage: 'Il manque un type de culture',
        select () {
          return collectIds(f => {
            if (!Array.isArray(f.properties.cultures)) {
              return true
            }

            const eachHasCultureCode = f.properties.cultures.every(({ CPF }) => Boolean(CPF))
            if (f.properties.cultures.length === 0 || eachHasCultureCode === false) {
              return false
            }
          })
        }
      }
    ],
    [
      RuleSet.CULTURE_UNSURE,
      {
        property: 'cultures',
        required: true,
        errorMessage: 'La culture est à préciser',
        select () {
          return collectIds(f => {
            if (!Array.isArray(f.properties.cultures)) {
              return false
            }

            return f.properties.cultures.some(({ CPF, TYPE, GF }) => {
              if (!CPF && (TYPE || GF)) {
                return true
              }

              return !fromCodeCpf(CPF)?.is_selectable
            })
          })
        }
      }
    ],
    [
      RuleSet.CONVERSION_LEVEL_MISSING,
      {
        property: 'conversion_niveau',
        required: permissions.isOc,
        errorMessage: 'Il manque un niveau de conversion',
        select (level = LEVEL_UNKNOWN) {
          return collectIds(f => {
            return !f.properties.conversion_niveau || f.properties.conversion_niveau === level
          })
        }
      }
    ],
    [
      RuleSet.CONVERSION_LEVEL_UNSURE,
      {
        property: 'conversion_niveau',
        required: permissions.isOc,
        errorMessage: 'Le niveau de conversion en agriculture biologique a besoin d\'être précisé',
        select (level = LEVEL_MAYBE_AB) {
          return collectIds(f => {
            return f.properties.conversion_niveau === level
          })
        }
      }
    ],
    [
      RuleSet.ENGAGEMENT_DATE_MISSING,
      {
        property: 'engagement_date',
        required: permissions.isOc,
        errorMessage: 'Il manque une date d\'engagement',
        select () {
          return collectIds(f => {
            return !f.properties.engagement_date && [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(f.properties.conversion_niveau)
          })
        }
      }
    ],
    [
      RuleSet.GEOMETRY_MISSING,
      {
        property: '_geometry',
        required: permissions.isOc,
        errorMessage: 'Il manque des coordonnées géométriques',
        select () {
          return collectIds(f => {
            return !f.geometry || (Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length === 0)
          })
        }
      }
    ],
    [
      RuleSet.ANNOTATED,
      {
        property: 'annotations',
        required: false,
        select () {
          return collectIds(f => {
            return f.properties.annotations && Object.keys(f.properties.annotations).length > 0
          })
        }
      }
    ],
  ])

  /**
   * @type {computed<Map<SetResult>>}
   */
  const results = computed(() => new Map(
    Array.from(set.entries())
      .map(([id, item]) => {
        const featureIds = item.select()
        return [
          id,
          {
            ...item,
            count: featureIds.length,
            featureIds
          }
        ]
      })
      .filter(([, { count }]) => count)
  ))

  const hasRequiredItems = computed(() => Array.from(results.value.values()).some(({ required }) => required))

  /**
   * @param {String} featureId
   * @returns {Map<SetResult>}
   */
  function byFeature (featureId) {
    return new Map(
      Array.from(results.value.entries())
        .filter(([, { featureIds }]) => featureIds.includes(featureId))
    )
  }

  /**
   * @param {String} featureId
   * @param {String} property
   * @returns {Map<SetResult>}
   */
  function byFeatureProperty (featureId, property) {
    return new Map(
      Array.from(results.value.entries())
        .filter(([, { featureIds }]) => featureIds.includes(featureId))
        .filter(([, { property: prop }]) => prop === property)
    )
  }

  /**
   * @param {String} featureId
   * @param {String} item
   * @returns {Map<SetResult>}
   */
  function byFeatureItem (featureId, itemId) {
    return new Map(
      Array.from(results.value.entries())
        .filter(([id]) => id === itemId)
        .filter(([, { featureIds }]) => featureIds.includes(featureId))
    )
  }

  /**
   * @param {String} itemId
   * @returns {Boolean}
   */
  function isRequired (itemId) {
    return Array.from(set.entries())
      .some(([id, { required }]) => itemId === id && required)
  }

  return {
    // computed
    hasRequiredItems,
    results,

    // general methods
    isRequired,
    // per feature methods
    byFeature,
    byFeatureProperty,
    byFeatureItem,
  }
})
