import { utils } from 'xlsx'
import { cultureLabel, featureName } from "../index.js"

export default class BaseExporter {
  label = ''
  extension = ''
  mimetype = ''
  origin = 'A1'

  constructor ({ featureCollection, operator, record }) {
    this.featureCollection = featureCollection
    this.operator = operator
    this.record = record
  }

  toJSON () {
    return utils.sheet_to_json(this.getSheet(), { header: 1, origin })
  }
}

/**
 *
 * @param {Feature[]} features
 * @returns {String}
 */
export function generateAutresInfos (features, { withDate = true, withName = true, withNotes = true, withSurface = true, withVariete = true, pivot = null, initialCulture } = {}) {
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
          withVariete ? c.variete : '',
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
