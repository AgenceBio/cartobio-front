import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { featureName, legalProjectionSurface } from '@/components/Features/index.js'
import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, book_append_sheet, book_new, sheet_add_aoa } = utils

/**
 * @typedef {import('geojson').Feature} Feature
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {import('xlsx').WorkSheet } WorkSheet
 */

/**
 * @param {{ featureCollection: FeatureCollection, operator: {}}} params
 * @returns {WorkSheet}
 */
function getSheet () {
  const { permissions } = this
  const sheet = aoa_to_sheet([
    [
      "Production (code CPF)",
      "Notes de l'auditeur",
      "Nom",
      "Surface",
      "Classe",
      "Date de début de conversion",
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
    // Date de début de conversion
    { wch: 10 },
    // Id. Parcelle
    { wch: 16 },
  ]

  this.getSortedFeatures().forEach((feature, index) => {
    const { properties } = feature
    const firstCulture = properties.cultures.at(0) ? fromCodeCpf(properties.cultures.at(0)?.CPF) : { code_cpf: '[ERREUR] culture absente' }
    const autresInfos = generateAutresInfos([ { properties }], { withName: false, withAnnotations: true, initialCulture: firstCulture?.code_cpf, permissions })
    const rowIndex = 2 + index

    sheet_add_aoa(sheet, [
      [
        firstCulture?.code_cpf ?? `[ERREUR] culture inconnue (${properties.cultures.at(0)?.CPF})`,
        autresInfos,
        featureName(feature, { placeholder: '', explicitName: true }),
        legalProjectionSurface(feature) / 10_000,
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
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet = getSheet

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'Export CartoBio')
    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }
}



export default BureauVeritasExporter;
