import groupBy from 'array.prototype.groupby'
import { featureCollection, feature } from '@turf/helpers'
import difference from '@turf/difference'
import intersect from '@turf/intersect'
import area from '@turf/area'
import { libelléFromCode } from '@/referentiels/pac.js'
import { conversionLevels } from '@/referentiels/ab.js'
import { parseReference } from "@/components/cadastre.js";

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
 * @property {String} key
 * @property {String} pivot
 * @property {Feature[]} features
 * @property {Number} surface
 */

export const GROUPE_COMMUNE = 'COMMUNE'
export const GROUPE_CULTURE = 'CULTURE'
export const GROUPE_ILOT = 'ILOT'
export const GROUPE_NIVEAU_CONVERSION = 'NIVEAU_CONVERSION'
export const GROUPE_DATE_ENGAGEMENT = 'DATE_ENGAGEMENT'
export const GROUPE_ANNEE_ENGAGEMENT = 'ANNEE_ENGAGEMENT'

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
    groupLabelFn: (d) => {
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
    datapoint: (d) => d.properties.NUMERO_I || '',
    groupLabelFn: (d) => d.properties.NUMERO_I ? `Îlot ${d.properties.NUMERO_I}` : 'Numéro d\'îlot non-précisé',
    sortFn: sortByAscendingFeatureProperty((d) => d.properties.NUMERO_I || '')
  },
  [GROUPE_CULTURE]: {
    label: 'type de culture',
    datapoint: (d) => d.properties.TYPE,
    groupLabelFn: (d) => libelléFromCode(d.properties.TYPE),
    sortFn: sortByAscendingLabel
  },
  [GROUPE_NIVEAU_CONVERSION]: {
    label: 'niveau de conversion',
    datapoint: (d) => d.properties.conversion_niveau || '',
    groupLabelFn: (d, groupingKey) => conversionLevels.find(({ value }) => value === groupingKey)?.label || 'Niveau de conversion inconnu',
    sortFn: sortBySurface
  },
  [GROUPE_ANNEE_ENGAGEMENT]: {
    label: 'année d\'engagement',
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : '',
    groupLabelFn: (d, groupingKey) => groupingKey || 'Année d\'engagement inconnue',
    sortFn: sortByDescendingKey
  },
}

Object.defineProperty(groupingChoices, GROUPE_DATE_ENGAGEMENT, {
  enumerable: false,
  value: {
    label: null,
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).toISOString().split('T').at(0) : '',
    groupLabelFn: (d, groupingKey) => groupingKey || 'Année d\'engagement inconnue',
    sortFn: sortByDescendingKey
  },
})

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
  const groups = groupBy(collection.features, (feature) => {
    return pivots
      .map(pivot => groupingChoices[pivot].datapoint(feature))
      .join('-')
  })

  return Object.entries(groups).map(([key, features]) => ({
    label: groupingChoices[pivots.at(0)].groupLabelFn(features[0], key),
    key: key.split('-').at(0),
    pivot,
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
export function featureName (feature, { ilotLabel = 'ilot ', parcelleLabel = 'parcelle ', separator = ', '} = {}) {
  if (feature.properties.NOM) {
    return feature.properties.NOM
  }
  else if (feature.properties.NUMERO_I || feature.properties.NUMERO_P) {
    return [
      feature.properties.NUMERO_I ? `${ilotLabel}${feature.properties.NUMERO_I}` : '',
      feature.properties.NUMERO_P ? `${parcelleLabel}${feature.properties.NUMERO_P}` : '',
    ]
    .filter(d => d)
    .join(separator)
  }
  else if (feature.properties.cadastre) {
    let {prefix, section, number} = parseReference(feature.properties.cadastre)
    return `Reférence cadastrale ${prefix !== '000' ? prefix : ''} ${section} ${number}`
  }
  else {
    return '-'
  }
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

/**
 * @param {Feature|Geometry} geometryOrFeature
 * @returns {Number}
 */
export function surface (geometryOrFeature) {
  return ['FeatureCollection', 'Feature'].includes(geometryOrFeature.type)
    // we have a full feature
    ? area(geometryOrFeature)
    // we only have a geometry
    : area(feature(geometryOrFeature))
}

/**
 * Returns a geometry, without any content part of a feature collection
 *
 * @param {Feature} geometry
 * @param {FeatureCollection} featureCollection
 * @returns {Feature}
 */
export function diff (feature, featureCollection) {
  return featureCollection.features.reduce((reducedFeature, target) => {
    if (!intersect(reducedFeature, target)) {
      return reducedFeature
    }

    return difference(reducedFeature, target)
  }, feature)
}
