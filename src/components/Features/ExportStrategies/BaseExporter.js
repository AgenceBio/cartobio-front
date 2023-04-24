export default class BaseExporter {
  label = ''
  extension = ''
  mimetype = ''

  constructor({ featureCollection, operator }) {
    this.featureCollection = featureCollection
    this.operator = operator
  }
}
