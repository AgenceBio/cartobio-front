import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { surface } from '@/components/Features/index.js'
import { certificationStates, CERTIFICATION_STATE, isABLevel } from '@/referentiels/ab.js'
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
const getSheet = ({ featureCollection, operator, permissions, record }) => {
  const notification = operator.notifications.find(({ status }) => status === 'ACTIVE') ?? operator.notifications.at(0)
  const statut = certificationStates[record.certification_state] ?? certificationStates[CERTIFICATION_STATE.UNKNOWN]

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    [
      "SITE ID de l'opérateur",
      "Numéro PACAGE",
      "Numéro Bio",
      "Statut Cartobio",
      "Id Parcelle",
      "Numéro Ilôt",
      "Numéro Parcelle",
      "BIO",
      "Classement",
      "Date de conversion",
      "Auditeur_note / Autres infos",
      "Code CPF",
      "Code Produit",
      "Catégorie",
      "Produit",
      "Surface",
      "Variété / Complément certificat",
      "Date de semis"
    ],
  ])

  sheet['!cols'] = [
    // Site ID
    { wch: 16 },
    // Numéro PACAGE
    { wch: 12 },
    // Numéro Bio
    { wch: 12 },
    // Statut Cartobio
    { wch: 16 },
    // Id Parcelle
    { wch: 16 },
    // Numéro Ilôt
    { wch: 4 },
    // Numéro Parcelle
    { wch: 4 },
    // BIO
    { wch: 4 },
    // Classement
    { wch: 10 },
    // Date de conversion
    { wch: 10 },
    // Auditeur_note / Autres infos
    { wch: 40 },
    // Code CPF
    { wch: 12 },
    // Code Produit
    { wch: 12 },
    // Catégorie
    { wch: 20 },
    // Produit
    { wch: 20 },
    // Surface
    { wch: 8 },
    // Variété / Complément certificat
    { wch: 40 },
    // Date de semis
    { wch: 12 }
  ]

  sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties, id }) => {
    const culture = fromCodeCpf(properties.cultures.at(0)?.CPF)
    const autresInfos = generateAutresInfos([{ id, geometry, properties }], { withAnnotations: true, withDate: false, withName: false, withNotes: true, withSurface: false, withVariete: false, initialCulture: culture?.code_cpf, permissions })
    const varietes = generateAutresInfos([{ id, geometry, properties }], { withDate: false, withName: false, withNotes: false, withSurface: false, withVariete: true, initialCulture: culture?.code_cpf })
    const dateSemis = generateAutresInfos([{ id, geometry, properties }], { withDate: true, withName: false, withNotes: false, withSurface: false, withVariete: false, initialCulture: culture?.code_cpf })

    return [
      notification.numeroClient,
      operator.numeroPacage,
      operator.numeroBio,
      statut.label,
      String(properties.id),
      properties.NUMERO_I,
      properties.NUMERO_P,
      isABLevel(properties.conversion_niveau) ? 1 : 0,
      properties.conversion_niveau,
      properties.engagement_date ? new Date(properties.engagement_date) : '',
      autresInfos,
      culture?.code_cpf,
      culture?.code_bureau_veritas,
      culture?.groupe,
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      surface(geometry) / 10_000,
      varietes,
      dateSemis
    ]
  }), { origin: 'A2', cellDates: true });

  featureCollection.features.forEach((feature, index) => {
    // surface is a 2 digits figure
    sheet[`P${2 + index}`].t = 'n'
    sheet[`P${2 + index}`].z = '0.00'
  })

  return sheet
}

class BureauVeritasExporter extends BaseExporter {
  label = 'Excel'
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator, permissions: this.permissions, record: this.record })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'AppliAgro')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }
}



export default BureauVeritasExporter;
