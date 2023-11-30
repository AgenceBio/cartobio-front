import { utils } from 'xlsx'
import { cultureLabel, featureName } from "../index.js"
import { getAnnotationLabel } from '../../../referentiels/ab.js'

export default class BaseExporter {
  label = ''
  extension = ''
  mimetype = ''
  range = null

  constructor ({ featureCollection, operator, record, permissions }) {
    this.featureCollection = featureCollection
    this.operator = operator
    this.record = record
    this.permissions = permissions
  }

  toJSON () {
    const ws = this.getSheet()
    return utils.sheet_to_json(ws, {
      blankrows: false,
      defval: '',
      header: 1,
      range: this.range ?? ws['!ref']
    })
  }
}

/**
 *
 * @param {Feature[]} features
 * @returns {String}
 */
export function generateAutresInfos (features, { withAnnotations = false, withCulture = true, withDate = true, withName = true, withNotes = true, withSurface = true, withVariete = true, pivot = null, initialCulture, permissions = {} } = {}) {
  const dateFmnt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  })

  const aggregateAnnotations = (annotations) => annotations.map(getAnnotationLabel).join(', ')
  const dropEmptyItem = (d) => d

  return features.map(feature => {
    const name = withName ? featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.', placeholder: '' }) : ''
    const notes = withNotes ? feature.properties.auditeur_notes : ''
    const annotations = withAnnotations && permissions.canExportAnnotations && Array.isArray(feature.properties.annotations) ? aggregateAnnotations(feature.properties.annotations) : ''

    const cultures = feature.properties.cultures
      // refine on a given culture, or use everything
      // useful when we display cells in combination with `getFeatureGroups()`
      // as we don't want to repeat the comment in all the 'comment' cells
      .filter(({ CPF }) => pivot ? CPF === pivot : true)
      .map(c => ([
          // if we refine on a given culture, we certainly have a cell with its label
          // so we don't make it redundant
          pivot || (initialCulture === c.CPF) || !withCulture ? '' : cultureLabel(c, { withCode: true }),
          withVariete && c.variete ? c.variete : '',
          withDate && c.date_semis ? `semis le ${dateFmnt.format(new Date(c.date_semis))}` : '',
          withSurface && c.surface ? `${c.surface}ha` : ''
        ]
        .filter(dropEmptyItem)
        .join(', '))
      )
      .filter(dropEmptyItem)
      .join(' / ')

    return [name, cultures, notes, annotations].filter(dropEmptyItem).join(', ')
  })
  .filter(dropEmptyItem)
  .join(' ; ')
}
