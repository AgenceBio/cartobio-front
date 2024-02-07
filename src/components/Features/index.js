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
 * @typedef IgnFeature
 * @property {String=} id
 * @property {Geometry} geometry
 * @property {IgnFeatureProperties} properties
 * @property {String} type
 */
/**
 * @typedef IgnFeatureProperties
 * @property {String} id
 * @property {String} departmentcode
 * @property {String} municipalitycode
 * @property {String} oldmunicipalitycode
 * @property {String} districtcode
 * @property {String} section
 * @property {String} sheet
 * @property {String} number
 * @property {String} city
 * @property {Geometry} truegeometry
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

class FeatureError extends ReferenceError {
  name = 'FeatureError'
  #label = 'Erreur de parcelle'

  constructor (featureId) {
    super(`Problème avec la parcelle ${featureId}`)

    this.id = featureId
  }

  /**
   * As displayed in the UI
   *
   * @returns {String}
   */
  toString () {
    return this.message
  }

  /**
   * As POSTed via the HTTP API
   */
  valueOf () {
    return { id: this.id, name: this.#label }
  }
}

export class FeatureNotFoundError extends FeatureError {
  name = 'FeatureNotFoundError'
  label = 'Parcelle introuvable'

  toString () {
    return `La référence cadastrale ${this.id} est introuvable dans le parcellaire informatisé.`
  }
}

export class FeatureWithoutGeometryError extends FeatureError {
  name = 'FeatureWithoutGeometryError'
  label = 'Contour géographique absent'

  toString () {
    return `Impossible d'obtenir le dessin géographique de la référence cadastrale ${this.id} n'a pas été retournée par le parcellaire informatisé.`
  }
}

/**
 * @enum {Number}
 */
const SORT = {
  ASCENDING: 1,
  DESCENDING: -1
}

/**
 *
 * @param {function(Feature): function} propertyAccessor
 * @param {SORT} order
 * @returns {function(GroupOrFeature, GroupOrFeature): Number}
 */
export function sortByAccessor (propertyAccessor, order = SORT.ASCENDING) {
  const isNumeric = (d) => typeof d === 'number' || Number.isNaN(parseInt(d, 10)) === false

  return function sortByAscendingFeatureGroupProperty (groupA, groupB) {
    const a = String(propertyAccessor(groupA))
    const b = String(propertyAccessor(groupB))

    return a.localeCompare(b, 'fr-FR', {
      usage: 'sort',
      numeric: isNumeric(propertyAccessor(groupA))
    }) * order
  }
}

const NO_GROUP = '__nogroup__'
const PACNotationOptions = {
  ilotLabel: '',
  parcelleLabel: '',
  separator: '.'
}

/**
 * @type {Record<string, GroupingChoice>}
 */
export const groupingChoices = {
  [GROUPE_COMMUNE]: {
    label: 'commune',
    labelNoGroup: 'Commune inconnue',
    datapoint: (d) => d.properties.COMMUNE || NO_GROUP,
    groupLabelFn ({ featureSample: d }) {
      if (d.properties.COMMUNE_LABEL) {
        return `${d.properties.COMMUNE_LABEL} (${d.properties.COMMUNE.slice(0, -3)})`
      }
      else if (d.properties.COMMUNE) {
        return d.properties.COMMUNE
      }
      else {
        return this.labelNoGroup
      }
    },
    sortFn: sortByAccessor((g) => g.surface, SORT.DESCENDING),
    sortFeaturesFn: sortByAccessor((f) => featureName(f, PACNotationOptions), SORT.ASCENDING),
  },
  [GROUPE_ILOT]: {
    label: 'îlot PAC',
    labelNoGroup: 'Non précisé ou hors-PAC',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => 'NUMERO_I' in d.properties ? d.properties.NUMERO_I : NO_GROUP,
    groupLabelFn ({ featureSample: d }) {
      if (d.properties.NUMERO_I) {
        return `Îlot ${d.properties.NUMERO_I}`
      }
      else {
        return this.labelNoGroup
      }
    },
    sortFn: sortByAccessor((g) => parseInt(g.features.at(0).properties.NUMERO_I, 10) || Infinity, SORT.ASCENDING),
    sortFeaturesFn: sortByAccessor((f) => parseInt(f.properties.NUMERO_P, 10) || Infinity, SORT.ASCENDING),
  },
  [GROUPE_CULTURE]: {
    label: 'type de culture',
    labelNoGroup: 'Absence de culture',
    labelUnknown: 'Culture inconnue',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => Array.isArray(d.properties.cultures) && d.properties.cultures.length ? d.properties.cultures.map(({ CPF }) => CPF) : [NO_GROUP],
    groupLabelFn ({ datapoint }) {
      return datapoint === NO_GROUP ? this.labelNoGroup : (fromCodeCpf(datapoint)?.libelle_code_cpf || this.labelUnknown)
    },
    sortFn: sortByAccessor((g) => fromCodeCpf(g.mainKey)?.libelle_code_cpf || '', SORT.ASCENDING),
    sortFeaturesFn: sortByAccessor((f) => featureName(f, PACNotationOptions), SORT.ASCENDING)
  },
  [GROUPE_NIVEAU_CONVERSION]: {
    label: 'niveau de conversion',
    labelNoGroup: 'Niveau de conversion inconnu',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.conversion_niveau || NO_GROUP,
    groupLabelFn ({ groupingKey }) {
      return conversionLevels.find(({ value }) => value === groupingKey)?.label || this.labelNoGroup
    },
    sortFn: sortByAccessor((g) => g.surface, SORT.DESCENDING),
    sortFeaturesFn: sortByAccessor((f) => featureName(f, PACNotationOptions), SORT.ASCENDING)
  },
  [GROUPE_ANNEE_ENGAGEMENT]: {
    label: 'année d\'engagement',
    labelNoGroup: 'Absence d\'année d\'engagement',
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : NO_GROUP,
    groupLabelFn ({ groupingKey }) {
      return groupingKey === NO_GROUP ? this.labelNoGroup : groupingKey
    },
    sortFn: sortByAccessor((g) => g.features.at(0).properties.engagement_date, SORT.DESCENDING),
    sortFeaturesFn: sortByAccessor((f) => featureName(f, PACNotationOptions), SORT.ASCENDING)
  },
}

Object.defineProperty(groupingChoices, GROUPE_DATE_ENGAGEMENT, {
  enumerable: false,
  value: {
    label: null,
    /** @param {GeoJSONFeature} */
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).toISOString().split('T').at(0) : '',
    groupLabelFn: ({ groupingKey }) => groupingKey || 'Année d\'engagement inconnue',
    sortFn: sortByAccessor((g) => g.key, SORT.DESCENDING),
    sortFeaturesFn: sortByAccessor((f) => featureName(f, PACNotationOptions), SORT.ASCENDING)
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
    const datapoints = pivots.map(pivot => groupingChoices[pivot].datapoint(feature))
    const groupingKeys = createGroupingKeys(datapoints)

    groupingKeys.forEach(groupKey => {
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }

      groups.set(groupKey, [...groups.get(groupKey), feature].sort(groupingChoices[pivots.at(0)].sortFeaturesFn))
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
  if (!culture) {
    return groupingChoices[GROUPE_CULTURE].labelNoGroup
  }

  const label = fromCodeCpf(culture.CPF)?.libelle_code_cpf || groupingChoices[GROUPE_CULTURE].labelUnknown

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

  // if the input is out of bounds (eg: absent geometry), bbox returns [Infinite, Infinite, -Infinite, -Infinite]
  // but mostly, MapLibre fails if the bounds are not withing the Web Mercator bounds
  const result = bbox(featureCollection)
  return Math.abs(result.at(0)) > 90 ? defaults : result
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

/**
 * Fetch a single geometry for a given cadastral reference
 *
 * @param {String} q
 * @param {Feature} baseFeature
 * @throws {Error}
 * @returns {Promise<{ geometry: Geometry, feature: Feature }>}
 */
async function fetchCadastreGeometry (q, baseFeature) {
  const { data } = await axios.get('https://data.geopf.fr/geocodage/search', {
    params: {
      q,
      index: 'parcel',
      limit: 1,
      returntruegeometry: true
    }
  })

  /** @type {IgnFeature=} */
  const cadastreFeature = data.features.at(0)

  if (!cadastreFeature) {
    throw new FeatureNotFoundError(q)
  }

  const geometry = cadastreFeature.properties.truegeometry

  if (!geometry) {
    throw new FeatureWithoutGeometryError(q)
  }

  return {
    geometry,
    feature: feature(geometry, {
      ...baseFeature.properties,
      COMMUNE_LABEL: cadastreFeature.properties.city,
      COMMUNE: `${cadastreFeature.properties.departmentcode}${cadastreFeature.properties.municipalitycode}`
    }, { id: baseFeature.id ?? baseFeature.properties.id })
  }
}

/**
 * Augments features with no geometry and
 * @param {FeatureCollection} baseCollection
 * @param {String} field feature property name to collect and fetch the geometry against
 * @throws {Error}
 * @returns {Promise<{ featureCollection: FeatureCollection, warnings: String[] }>}
 */
export async function applyCadastreGeometries (baseCollection, field = 'cadastre') {
  const warnings = []

  const results = await Promise.allSettled(baseCollection.features.map(feature => {
    if (!feature.geometry && Array.isArray(feature.properties[field])) {
      return fetchCadastreGeometry(feature.properties[field][0], feature)
    }
  }))

  const featureCollection = {
    ...baseCollection,
    features: results.map(({ status, value, reason }) => {
      if (status === 'rejected') {
        warnings.push(reason)
        return
      }

      return value.feature
    }).filter(feature => feature)
  }

  return { featureCollection, warnings }
}
