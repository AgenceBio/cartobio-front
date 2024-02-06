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
      "Précision",
      "Étiquettes",
      "Notes de l'auditeur",
      "Nom",
      "Surface",
      "Classe",
      "Date d'engagement",
      "Id. Parcelle"
    ]
  ])

  sheet['!cols'] = [
    // Production (code CPF)  #A
    { wch: 40 },
    // Culture précision      #B
    { wch: 20 },
    // Étiquettes             #C
    { wch: 40 },
    // Notes de l\'auditeur   #D
    { wch: 40 },
    // Nom                    #E
    { wch: 16 },
    // Surface                #F
    { wch: 16 },
    // Classe                 #G
    { wch: 8 },
    // Date d'engagement      #H
    { wch: 10 },
    // Id. Parcelle           #I
    { wch: 16 },
  ]

  featureCollection.features.forEach(({ geometry, properties }, index) => {
    const firstCulture = fromCodeCpf(properties.cultures.at(0)?.CPF)
    const rowIndex = 2 + index

    sheet_add_aoa(sheet, [
      [
        firstCulture?.code_cpf ?? `[ERREUR] culture inconnue`,
        generateAutresInfos([ { properties }], { withAnnotations: false, withCulture: true, withDate: false, withName: false, withNotes: false, withSurface: true, withVariete: true, initialCulture: firstCulture?.code_cpf, permissions }),
        generateAutresInfos([ { properties }], { withAnnotations: true, withCulture: false, withDate: false, withName: false, withNotes: false, withSurface: false, withVariete: false, initialCulture: firstCulture?.code_cpf, permissions }),
        generateAutresInfos([ { properties }], { withAnnotations: false, withCulture: true, withDate: true, withName: false, withNotes: true, withSurface: false, withVariete: false, initialCulture: firstCulture?.code_cpf, permissions }),
        featureName({ properties }, { placeholder: '' }),
        surface(geometry) / 10_000,
        properties.conversion_niveau,
        properties.engagement_date ? new Date(properties.engagement_date) : '',
        String(properties.id)
      ]
    ], { origin: `A${rowIndex}`, cellDates: true });

    // surface is a 2 digits figure
    sheet[`F${rowIndex}`].t = 'n'
    sheet[`F${rowIndex}`].z = '0.00'
    sheet[`I${rowIndex}`].t = 's'

    if (sheet[`H${rowIndex}`].v) {
      sheet[`H${rowIndex}`].t = 'd'
      sheet[`H${rowIndex}`].z = 'dd/mm/yyyy'
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
