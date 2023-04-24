import { utils } from 'xlsx'

const { sheet_to_csv } = utils

export default class BaseExporter {
  label = ''
  extension = ''
  mimetype = ''

  constructor({ featureCollection, operator }) {
    this.featureCollection = featureCollection
    this.operator = operator
  }

  toClipboard() {
    const sheet = this.getSheet()
    let data = sheet_to_csv(sheet, { FS: '\t' })
    return navigator.clipboard.writeText(data)
  }
}
