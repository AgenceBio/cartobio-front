import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import {
  getFeatureGroups,
  GROUPE_CULTURE,
  GROUPE_DATE_ENGAGEMENT,
  GROUPE_NIVEAU_CONVERSION
} from '@/components/Features/index.js'
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
const getSheet = ({ featureCollection, operator }) => {
  const notification = operator.notifications.find(({ status }) => status === 'ACTIVE') ?? operator.notifications.at(0)

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    [
      'SITE ID de l\'opérateur',
      'Catégorie', 'Produit',
      'Code Produit',
      'Complément certificat',
      'Autres infos',
      'Surface',
      'Unité',
      'Classement',
      'Date conversion'
    ],
    [
      notification.numeroClient ?? ''
    ],
    [
      'PV'
    ]
  ])

  sheet['!cols'] = [
    // Site ID
    { wch: 16 },
    // Catégorie
    { wch: 12 },
    // Produit
    { wch: 40 },
    // Code Produit
    { wch: 16 },
    // Complément certificat (variété)
    { wch: 40 },
    // Autres infos (ilot.parcelle date de semis)
    { wch: 40 },
    // Surface
    { wch: 12 },
    // Unité
    { wch: 6 },
    // Classement
    { wch: 8 },
    // Date de conversion
    { wch: 10 }
  ]

  getFeatureGroups(featureCollection, [GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION, GROUPE_DATE_ENGAGEMENT]).forEach(({ mainKey, surface, features }, index) => {
    const culture = fromCodeCpf(mainKey)
    const autresInfos = generateAutresInfos(features)

    sheet_add_aoa(sheet, [
      [
        culture?.groupe,
        culture?.libelle_code_cpf ?? `[ERREUR] correspondance manquante avec ${mainKey}`,
        culture?.code_bureau_veritas,
        // Complément certificat (variété)
        features.flatMap(f => f.properties.cultures.map(c => c.variete)).filter(d => d).join(', '),
        // Autres infos (ilot.parcelle date de semis Notes de certification)
        `Ilots : ${autresInfos}`,
        surface / 10_000,
        'ha',
        features.at(0).properties.conversion_niveau,
        features.at(0).properties.engagement_date,
      ]
    ], { origin: `B${2 + index}`, cellDates: true });

    // Formattage des totaux
    sheet[`G${2 + index}`].t = 'n'
    sheet[`G${2 + index}`].z = '0.00'
  })

  return sheet
}

class BureauVeritasExporter extends BaseExporter {
  label = 'Excel'
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'AppliAgro')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }
}



export default BureauVeritasExporter;
