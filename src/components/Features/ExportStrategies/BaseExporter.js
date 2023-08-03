import { cultureLabel, featureName } from "../index.js"

export default class BaseExporter {
  label = ''
  extension = ''
  mimetype = ''

  constructor({ featureCollection, operator }) {
    this.featureCollection = featureCollection
    this.operator = operator
  }
}

/**
 *
 * @param {Feature[]} features
 * @returns {String}
 */
export function generateAutresInfos (features, { withName= true } = {}) {
  return features.map(feature => {
    const name = withName ? featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.', placeholder: '' }) : ''

    const cultures = feature.properties.cultures.map(c => {
      return [cultureLabel(c, { withCode: true }), c.variete, c.date_semis, c.surface ? `${c.surface}ha` : ''].filter(d => d).join(', ')
    }).join(' / ')

    return [name, cultures, feature.properties.auditeur_notes].filter(d => d).join(', ')
  })
  .filter(d => d)
  .join(' ; ')
}
