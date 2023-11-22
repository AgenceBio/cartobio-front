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
  const sheet = aoa_to_sheet([
    [
      'Cultures en place lors du contrôle',
      'Surfaces déclarées',
      'Réf parcelle (n° ilot, cadastre)',
      'Classement proposé',
      'Depuis'
    ],
  ])

  sheet['!cols'] = [
    // Produit
    { wch: 40 },
    // Surface
    { wch: 12 },
    // Autres infos (ilot.parcelle date de semis)
    { wch: 40 },
    // Classement
    { wch: 8 },
    // Date de conversion
    { wch: 10 }
  ]

  getFeatureGroups(featureCollection, [GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION, GROUPE_DATE_ENGAGEMENT]).forEach(({ mainKey, surface, features }, index) => {
    const culture = fromCodeCpf(mainKey)
    const autresInfos = generateAutresInfos(features, { pivot: mainKey })

    sheet_add_aoa(sheet, [
      [
        culture?.libelle_code_cpf ?? `[ERREUR] correspondance manquante avec ${mainKey}`,
        surface / 10_000,
        autresInfos,
        features.at(0).properties.conversion_niveau ?? '',
        features.at(0).properties.engagement_date ? new Date(features.at(0).properties.engagement_date) : '',
      ]
    ], { origin: `A${2 + index}`, cellDates: true });

    // surface is a 2 digits figure
    sheet[`B${2 + index}`].t = 'n'
    sheet[`B${2 + index}`].z = '0.00'
  })

  return sheet
}

export default class CertisudExporter extends BaseExporter {
  label = 'Excel'
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'Parcellaire')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }
}
