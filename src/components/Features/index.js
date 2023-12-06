import { featureCollection, feature } from '@turf/helpers'
import bbox from '@turf/bbox'
import difference from '@turf/difference'
import intersect from '@turf/intersect'
import area from '@turf/area'
import { conversionLevels } from '@/referentiels/ab.js'
import { parseReference } from "@/components/cadastre.js"
import { fromCodeCpf } from "@agencebio/rosetta-cultures"
import union from "@turf/union"
import axios from "axios"

/**
 * @typedef {import('geojson').Feature} Feature
 * @typedef {import('geojson').Geometry} Geometry
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 */

/**
 * @typedef GroupingChoice
 * @property {String} label
 * @property {function(Feature): String|Number} datapoint
 * @property {function(Feature): String} groupLabelFn
 * @property {function(FeatureGroup, FeatureGroup): Number} sortFn
 */

/**
 * @typedef FeatureGroup
 * @property {String} label
 * @property {String} key the datapoint in common with grouped items
 * @property {String} mainKey in case of multiple pivots, this ; otherwise it has the same value as key
 * @property {String} pivot grouping strategy identifier
 * @property {Feature[]} features
 * @property {Number} surface
 */

/**
 * @typedef FeaturePropertyCulture
 * @property {String} CPF
 * @property {=String} TYPE
 * @property {=String} variete
 * @property {Number} surface
 */

export const GROUPE_NONE = ''
export const GROUPE_COMMUNE = 'COMMUNE'
export const GROUPE_CULTURE = 'CULTURE'
export const GROUPE_ILOT = 'ILOT'
export const GROUPE_NIVEAU_CONVERSION = 'NIVEAU_CONVERSION'
export const GROUPE_DATE_ENGAGEMENT = 'DATE_ENGAGEMENT'
export const GROUPE_ANNEE_ENGAGEMENT = 'ANNEE_ENGAGEMENT'

/**  @enum {String} */
export const DeletionReasonsCode = {
  FEATURE_COLLECTION_LIFECYCLE: 'lifecycle',
  OTHER: 'other',
  USER_ERROR: 'error'
}

/**
 * @typedef DeletionReason
 * @property {DeletionReasonsCode} code
 * @property {String} label
 */

/**
 * @type {DeletionReason[]}
 */
export const deletionReasons = [
  { code: DeletionReasonsCode.USER_ERROR, label: 'Erreur' },
  { code: DeletionReasonsCode.FEATURE_COLLECTION_LIFECYCLE, label: 'Évolution du parcellaire' },
  { code: DeletionReasonsCode.OTHER, label: 'Autre' },
]

function sortBySurface (groupA, groupB) {
  return groupB.surface - groupA.surface
}

function sortByDescendingKey (groupA, groupB) {
  return groupB.key - groupA.key
}

function sortByAscendingLabel (groupA, groupB) {
  return groupA.label.localeCompare(groupB.label)
}

/**
 *
 * @param {function(Feature): function} propertyAccessor
 * @returns {function}
 */
function sortByAscendingFeatureProperty (propertyAccessor) {
  return function sortByAscendingFeatureGroupProperty (groupA, groupB) {
    const a = String(propertyAccessor(groupA.features.at(0)))
    const b = String(propertyAccessor(groupB.features.at(0)))

    return a.localeCompare(b, 'fr-FR', {
      usage: 'sort',
      numeric: true
    })
  }
}

/**
 * @type {Record<string, GroupingChoice>}
 */
export const groupingChoices = {
  [GROUPE_COMMUNE]: {
    label: 'commune',
    datapoint: (d) => d.properties.COMMUNE,
    groupLabelFn: ({ featureSample: d }) => {
      if (d.properties.COMMUNE_LABEL) {
        return `${d.properties.COMMUNE_LABEL} (${d.properties.COMMUNE.slice(0, -3)})`
      }
      else {
        return d.properties.COMMUNE || 'Commune inconnue'
      }
    },
    sortFn: sortBySurface
  },
  [GROUPE_ILOT]: {
    label: 'îlot PAC',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.NUMERO_I || '',
    groupLabelFn: ({ featureSample: d }) => d.properties.NUMERO_I ? `Îlot ${d.properties.NUMERO_I}` : 'Numéro d\'îlot non-précisé',
    sortFn: sortByAscendingFeatureProperty((d) => d.properties.NUMERO_I || '')
  },
  [GROUPE_CULTURE]: {
    label: 'type de culture',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.cultures.map(({ CPF }) => CPF),
    groupLabelFn: ({ datapoint }) => fromCodeCpf(datapoint)?.libelle_code_cpf || 'Type de culture inconnu',
    sortFn: sortByAscendingLabel
  },
  [GROUPE_NIVEAU_CONVERSION]: {
    label: 'niveau de conversion',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.conversion_niveau || '',
    groupLabelFn: ({ groupingKey }) => conversionLevels.find(({ value }) => value === groupingKey)?.label || 'Niveau de conversion inconnu',
    sortFn: sortBySurface
  },
  [GROUPE_ANNEE_ENGAGEMENT]: {
    label: 'année d\'engagement',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : '',
    groupLabelFn: ({ groupingKey }) => groupingKey || 'Année d\'engagement inconnue',
    sortFn: sortByDescendingKey
  },
}

Object.defineProperty(groupingChoices, GROUPE_DATE_ENGAGEMENT, {
  enumerable: false,
  value: {
    label: null,
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).toISOString().split('T').at(0) : '',
    groupLabelFn: ({ groupingKey }) => groupingKey || 'Année d\'engagement inconnue',
    sortFn: sortByDescendingKey
  },
})

export function createGroupingKeys (elements) {
  const keys = elements.reduce((keys, item, i) => {
    if (Array.isArray(item)) {
      keys = item.map(subkey => [...keys, subkey])
    }
    else {
      // we init for the first item
      if (i === 0) {
        keys.push([])
      }

      keys.forEach(k => k.push(item))
    }

    return keys
  }, [])

  return Array.from( new Set(keys.map(key => key.join('-'))) )
}

/**
 *
 * @param {FeatureCollection} collection
 * @param {String} pivot
 * @returns {FeatureGroup[]}
 */
export function getFeatureGroups (collection, pivot = GROUPE_CULTURE) {
  // Use a default pivot if none is provided
  if (pivot === '' || (Array.isArray(pivot) && pivot.length === 0)) {
    return [{
      label: '',
      key: 'none',
      pivot,
      features: collection.features,
      surface: inHa(area(featureCollection(collection.features))),
    }]
  }

  const pivots = Array.isArray(pivot) ? pivot : [pivot]

  /**
   * If [CULTURE, NIVEAU_CONVERSION, ANNEE_CONVERSION]
   * With [ [1a, [01.92, 01.26.1], AB, 2019], [1b, [01.92], AB, 2010] ]
   * Should expand to [ ['01.92-AB-2019', ...], ['01.26.1-AB-2019', ...], ['01.92-AB-2010', ...] ]
   * With step 1 [ [01.92, AB, 2019], [01.26.1, AB, 2019], [01.92, AB, 2010] ]
   */
  const groups = collection.features.reduce((groups, feature) => {
    const groupingKeys = createGroupingKeys(pivots.map(pivot => groupingChoices[pivot].datapoint(feature)))

    groupingKeys.forEach(groupKey => {
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }

      groups.set(groupKey, [...groups.get(groupKey), feature])
    })

    return groups
  }, new Map())


  return Array.from(groups).map(([groupingKey, features]) => ({
    label: groupingChoices[pivots.at(0)].groupLabelFn({
      featureSample: features[0],
      groupingKey,
      datapoint: groupingKey.split('-').at(0)
    }),
    key: groupingKey,
    mainKey: groupingKey.split('-').at(0),
    pivot: pivots.at(0),
    features,
    surface: area(featureCollection(features)),
  })).sort(groupingChoices[pivots.at(0)].sortFn)
}

/**
 * @param {Feature[]} features
 * @param {String} id
 * @returns {Feature}
 */
export function getFeatureById (features, id) {
  return features.find(feature => feature.id === id)
}

/**
 * @param {Feature} feature
 * @returns {String}
 */
export function featureName (feature, { ilotLabel = 'ilot ', parcelleLabel = 'parcelle ', separator = ', ', placeholder = '-'} = {}) {
  if (feature.properties.NOM) {
    return feature.properties.NOM
  }

  if (feature.properties.NUMERO_I || feature.properties.NUMERO_P) {
    return [
      Number.isNaN(parseInt(feature.properties.NUMERO_I, 10)) === false ? `${ilotLabel}${feature.properties.NUMERO_I}` : '',
      Number.isNaN(parseInt(feature.properties.NUMERO_P, 10)) === false ? `${parcelleLabel}${feature.properties.NUMERO_P}` : '',
    ]
    .filter(d => d)
    .join(separator)
  }

  if (feature.properties.cadastre) {
    if (Array.isArray(feature.properties.cadastre)) {
      const references = feature.properties.cadastre.map(cadastre => parseReference(cadastre))
      return `Parcelles ${references.map(cadastre => cadastre.number).join(separator)}`
    }

    const {prefix, section, number} = parseReference(feature.properties.cadastre)
    return [
      'Reférence cadastrale',
      prefix !== '000' ? prefix : '',
      section,
      number
    ].filter(d => d).join(' ')
  }
  else {
    return placeholder
  }
}

export async function featureDetails (feature) {
  const details = []

  if (feature.properties.cadastre) {
    const cadastre = Array.isArray(feature.properties.cadastre) ? feature.properties.cadastre : [feature.properties.cadastre]
    const references = cadastre
        .map(ref => parseReference(ref))

    const communes = (await Promise.all(
        references
        .map(({ commune }) => axios.get(`https://geo.api.gouv.fr/communes/${commune}`))
    )).map(({ data }) => data.nom)

    details.push(...references.map(
        ({ section, number }, index) => `Parcelle cadastrale ${number} (Section ${section}, ${communes[index]})`
    ))
  }

  return details
}

const cultureList = new Intl.ListFormat('fr', {
  style: 'short',
  type: 'conjunction' // "et"
})

/**
 *
 * @param {FeaturePropertyCulture} culture
 * @param {{ withCode: boolean }} options
 * @returns {string}
 */
export function cultureLabel (culture, { withCode = false } = {}) {
  const label = fromCodeCpf(culture.CPF)?.libelle_code_cpf || 'Culture inconnue'

  return withCode ? `${culture.CPF ?? culture.TYPE} ${label}` : label
}

/**
 *
 * @param {FeaturePropertyCulture[]} cultures
 * @returns {string}
 */
export function cultureLabels (cultures, options) {
  const labels = new Set(cultures.map(culture => cultureLabel(culture, options)))

  return cultureList.format(labels)
}

/**
 * @param {String|Number} value
 * @returns {String}
 */
export function inHa (value) {
  return parseFloat((value / 10000))
    .toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
}

export function bounds (featureCollection, defaults = bounds.DEFAULT_BOUNDS) {
  if (!featureCollection?.type || (featureCollection?.type === 'FeatureCollection' && !featureCollection.features.length)) {
    return defaults
  }

  return bbox(featureCollection)
}

bounds.DEFAULT_BOUNDS = [[-9.86, 41.15], [10.38, 51.56]]

/**
 * @param {FeatureCollection|Feature|Geometry} geometryOrFeature
 * @returns {Number}
 */
export function surface (geometryOrFeature) {
  if (Array.isArray(geometryOrFeature)) {
    return area(featureCollection(geometryOrFeature))
  }
  else if (['FeatureCollection', 'Feature'].includes(geometryOrFeature.type)) {
    return area(geometryOrFeature)
  }
  else {
    return area(feature(geometryOrFeature))
  }
}

/**
 * Returns a geometry, without any content part of a feature collection
 *
 * @param {Feature} feature
 * @param {FeatureCollection} featureCollection
 * @returns {Feature}
 */
export function diff (feature, featureCollection) {
  return featureCollection.features.reduce((reducedFeature, target) => {
    if (reducedFeature === null) {
      return null;
    }

    if (!intersect(reducedFeature, target)) {
      return reducedFeature
    }

    return difference(reducedFeature, target)
  }, feature)
}

/**
 * Merge all features into one single feature (union)
 *
 * @param {Array<Feature>} features
 * @returns {Feature}
 */
export function merge(features) {
  return features.reduce((mergedFeature, feature) => {
    if (mergedFeature === null) {
      return feature
    }

    return union(mergedFeature, feature)
  }, null)
}
