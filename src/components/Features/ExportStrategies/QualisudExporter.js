import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { featureName, surface } from '@/components/Features/index.js'
import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa, sheet_to_csv } = utils
const { sheet_to_json, json_to_sheet } = utils

/**
 * @typedef {import('geojson').Feature} Feature
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {import('xlsx').WorkSheet } WorkSheet
 */

/**
 * @param {{ featureCollection: FeatureCollection, operator: {}}} params
 * @returns {WorkSheet}
 */
const getSheet = ({ featureCollection, operator }) => {
  const sheet = aoa_to_sheet([
    [
      'Production (code CPF)',
      'Notes de l\'auditeur',
      'Nom',
      'Surface',
      'Classe',
      'Date d\'engagement',
      'Id. CartoBio'
    ]
  ])

  sheet['!cols'] = [
    // Production (code CPF)
    { wch: 40 },
    // Notes de l\'auditeur
    { wch: 40 },
    // Nom
    { wch: 16 },
    // Surface
    { wch: 16 },
    // Classe
    { wch: 8 },
    // Date d'engagement
    { wch: 10 },
    // Id. CartoBio
    { wch: 10 }
  ]

  featureCollection.features.forEach(({ geometry, properties }, index) => {
    const firstCulture = fromCodeCpf(properties.cultures.at(0)?.CPF)
    const autresInfos = generateAutresInfos([ { properties }], { initialCulture: firstCulture?.code_cpf, withName: false })
    const rowIndex = 2 + index

    sheet_add_aoa(sheet, [
      [
        firstCulture?.code_cpf ?? `[ERREUR] culture inconnue`,
        autresInfos,
        featureName({ properties }),
        surface(geometry) / 10_000,
        properties.conversion_niveau,
        properties.engagement_date ? properties.engagement_date : '',
        properties.id
      ]
    ], { origin: `A${rowIndex}`, cellDates: true });

    // Formattage des totaux
    sheet[`D${rowIndex}`].t = 'n'
    sheet[`D${rowIndex}`].z = '0.00'
    sheet[`G${rowIndex}`].t = 's'

    if (sheet[`F${rowIndex}`].v) {
      sheet[`F${rowIndex}`].t = 'd'
      sheet[`F${rowIndex}`].z = 'dd/mm/yyyy'
    }

  })

  return sheet
}

class BureauVeritasExporter extends BaseExporter {
  label = 'Tableur'
  extension = 'csv'
  mimetype = 'text/csv'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Export CartoBio')
    // Cette fonction ajoute un BOM ce que sheet_to_csv ne fait pas
    const data = write(workbook, { type: "array", bookType: 'csv', FS: ';' })
    return new Blob([data])
  }

  toClipboard() {
    let sheet = this.getSheet()
    sheet = sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
    // Remove first row, keep first columns A to I
    sheet = sheet.slice(1).map(row => row.slice(0, 7))
    sheet = json_to_sheet(sheet)
    const data = sheet_to_csv(sheet, { FS: '\t' })

    return navigator.clipboard.writeText(data)
  }
}



export default BureauVeritasExporter;
