import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { featureName, surface } from '@/components/Features/index.js'
import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa } = utils

/**
 * @typedef {import('geojson').Feature} Feature
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {import('xlsx').WorkSheet } WorkSheet
 */

/**
 * @param {{ featureCollection: FeatureCollection, operator: {}}} params
 * @returns {WorkSheet}
 */
const getSheet = ({ featureCollection, permissions }) => {
  const sheet = aoa_to_sheet([
    [
      "Production (code CPF)",
      "Notes de l'auditeur",
      "Nom",
      "Surface",
      "Classe",
      "Date d'engagement",
      "Id. Parcelle"
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
    // Id. Parcelle
    { wch: 16 },
  ]

  featureCollection.features.forEach(({ geometry, properties }, index) => {
    const firstCulture = fromCodeCpf(properties.cultures.at(0)?.CPF)
    const autresInfos = generateAutresInfos([ { properties }], { withName: false, withAnnotations: true, initialCulture: firstCulture?.code_cpf, permissions })
    const rowIndex = 2 + index

    sheet_add_aoa(sheet, [
      [
        firstCulture?.code_cpf ?? `[ERREUR] culture inconnue`,
        autresInfos,
        featureName({ properties }, { placeholder: '' }),
        surface(geometry) / 10_000,
        properties.conversion_niveau,
        properties.engagement_date ? new Date(properties.engagement_date) : '',
        String(properties.id)
      ]
    ], { origin: `A${rowIndex}`, cellDates: true });

    // surface is a 2 digits figure
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
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator, permissions: this.permissions })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Export CartoBio')
    // Cette fonction ajoute un BOM ce que sheet_to_csv ne fait pas
    const data = write(workbook, { type: "array", bookType: 'csv', FS: ';' })
    return new Blob([data])
  }
}



export default BureauVeritasExporter;
