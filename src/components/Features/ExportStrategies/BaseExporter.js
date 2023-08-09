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
export function generateAutresInfos (features, { withName = true, withNotes = true, withDate = true, withSurface = true, pivot = null, initialCulture } = {}) {
  return features.map(feature => {
    const name = withName ? featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.', placeholder: '' }) : ''
    const notes = withNotes ? feature.properties.auditeur_notes : ''

    const cultures = feature.properties.cultures
      // refine on a given culture, or use everything
      // useful when we display cells in combination with `getFeatureGroups()`
      // as we don't want to repeat the comment in all the 'comment' cells
      .filter(({ CPF }) => pivot ? CPF === pivot : true)
      .map(c => ([
          // if we refine on a given culture, we certainly have a cell with its label
          // so we don't make it redundant
          pivot || (initialCulture === c.CPF) ? '' : cultureLabel(c, { withCode: true }),
          c.variete,
          withDate ? c.date_semis : '',
          withSurface && c.surface ? `${c.surface}ha` : ''
        ].filter(d => d).join(', '))
      )
      .join(' / ')

    return [name, cultures, notes].filter(d => d).join(', ')
  })
  .filter(d => d)
  .join(' ; ')
}
