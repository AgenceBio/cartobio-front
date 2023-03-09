import groupBy from 'array.prototype.groupby'
import { featureCollection, feature } from '@turf/helpers'
import area from '@turf/area'
import { libelléFromCode } from '@/referentiels/pac.js'
import { conversionLevels } from '@/referentiels/ab.js'

const colorPalette = [
  "#ff73fa",
  "#76b100",
  "#ba00ae",
  "#01c672",
  "#0045b4",
  "#e1cc00",
  "#7c2d82",
  "#feff7c",
  "#ff8dee",
  "#408b00",
  "#b61300",
  "#ac9200"
]

export const GROUPE_COMMUNE = 'COMMUNE'
export const GROUPE_CULTURE = 'CULTURE'
export const GROUPE_NIVEAU_CONVERSION = 'NIVEAU_CONVERSION'
export const GROUPE_ANNEE_ENGAGEMENT = 'ANNEE_ENGAGEMENT'

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
    }
  },
  [GROUPE_CULTURE]: {
    label: 'type de culture',
    datapoint: (d) => d.properties.TYPE,
    groupLabelFn: (d) => libelléFromCode(d.properties.TYPE)
  },
  [GROUPE_NIVEAU_CONVERSION]: {
    label: 'niveau de conversion',
    datapoint: (d) => d.properties.conversion_niveau || '',
    groupLabelFn: (d, groupingKey) => conversionLevels.find(({ value }) => value === groupingKey)?.label || 'Niveau de conversion inconnu'
  },
  [GROUPE_ANNEE_ENGAGEMENT]: {
    label: 'année d\'engagement',
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : '',
    groupLabelFn: (d, groupingKey) => groupingKey || 'Année d\'engagement inconnue'
  },
}

export function getFeatureGroups (collection, pivot = GROUPE_CULTURE) {
  if (pivot === '') {
    return [{
      label: '',
      key: 'none',
      pivot,
      accentColor: colorPalette[0],
      features: collection.features,
      surface: inHa(area(featureCollection(collection.features))),
    }]
  }

  const groups = groupBy(collection.features, (feature) => {
    return groupingChoices[pivot].datapoint(feature)
  })

  return Object.entries(groups).map(([key, features], i) => ({
    label: groupingChoices[pivot].groupLabelFn(features[0], key),
    key,
    pivot,
    accentColor: colorPalette[i%12],
    features,
    surface: area(featureCollection(features)),
  })).sort((a, b) => b.surface - a.surface)
}

export function getFeatureById (features, id) {
  return features.find(feature => feature.id === id)
}

export function featureName (feature) {
  if (feature.properties.NOM) {
    return feature.properties.NOM
  }
  else if (feature.properties.NUMERO_I || feature.properties.NUMERO_P) {
    return [
      feature.properties.NUMERO_I ? `ilot ${feature.properties.NUMERO_I}` : '',
      feature.properties.NUMERO_P ? `parcelle ${feature.properties.NUMERO_P}` : '',
    ]
    .filter(d => d)
    .join(', ')
  }
  else {
    return '-'
  }
}

export function getFeatureGroupsStyles (groups) {
  return groups.flatMap(({ features, accentColor }) => ([
    ['in', ['get', 'id'], ['literal', features.map(({ id }) => id)]],
    accentColor
  ]))
}

export function inHa (value) {
  return parseFloat((value / 10000))
    .toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
}

export function surface (geometryOrFeature) {
  return ['FeatureCollection', 'Feature'].includes(geometryOrFeature.type)
    // we have a full feature
    ? area(geometryOrFeature)
    // we only have a geometry
    : area(feature(geometryOrFeature))
}
