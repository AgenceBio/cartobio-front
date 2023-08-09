import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { GROUPE_NIVEAU_CONVERSION, featureName, getFeatureGroups, surface } from '@/components/Features/index.js'

import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa, book_append_sheet, book_new } = utils
const { decode_range: R, sheet_to_json, json_to_sheet, sheet_to_csv } = utils

const getSheet = ({ featureCollection, operator, record }) => {
  const sheet = aoa_to_sheet([
    [],
    [],
    [],
    [],
    ['N° PACAGE', operator.numeroPacage],
    ['Description parcellaire','',            '',                       '',                            '',                      '',         'Cultures',                 '',                   '',                                        '',                           '',                    '',                                           '',             '',                 'Ferti/amendements/effluents',             '',                 'Traitements phytos',             '',          'Rendements',                   '',                                     '',   'Prévisionnel',                                                                            '',                      'Commentaires'],
    ['Nom de la parcelle', 'Ilot', 'N° parcelle', 'Surface graphique (ha)', 'Date de début de conversion', 'Précédent\n(année n-1)', 'Type de culture', 'Liste secondaire', 'Espèces implantées', 'Degré de conversion de la parcelle/ilot', 'Date de semis/implantation', 'Semence C2/Bio/Conv', 'Date de dérogation\n(NA si non applicable)', 'Conformité ?', 'Type/Nature des ferti/amendements/effluents', 'Conformité ?', 'Type/Nature des traitements phytos', 'Conformité ?', 'Rendement\n(qté/ha)', 'Rendement cohérent', 'Récolte gardée pour semence fermière', 'Culture prévue', 'Justificatif (facture d\'achat ou semences fermières) vu lors de l\'audit ?', 'Commentaire sur cet ilot/parcelle'],
  ])

  sheet['!merges'] = [
    R('G1:N1'), R('G2:N4'), R('R1:R5'),
    R('A6:F6'), R('G6:N6'), R('O6:P6'), R('Q6:R6'),
    R('S6:U6'), R('V6:W6'),
  ]

  sheet['!cols'] = [
    // Nom de la parcelle
    { wch: 16 },
    // Ilot
    { wch: 6 },
    // N° parcelle
    { wch: 10 },
    // Surface graphique (ha)
    { wch: 12 },
    // Date de début de conversion
    { wch: 12 },
    // Précédent\n(année n-1)
    '',
    // Type de culture
    { wch: 40 },
    // Liste secondaire
    { wch: 40 },
    // Espèces implantées
    { wch: 20 },
    // Degré de conversion de la parcelle/ilot
    { wch: 8 },
    // Date de semis/implantation
    { wch: 10 },
    // Semence C2/Bio/Conv
    '',
    // Date de dérogation\n(NA si non applicable)
    '',
    // Conformité ?
    '',
    // Type/Nature des ferti/amendements/effluents
    '',
    // Conformité ?
    '',
    // Type/Nature des traitements phytos
    '',
    // Conformité ?
    '',
    // Rendement\n(qté/ha)
    '',
    // Rendement cohérent
    '',
    // Récolte gardée pour semence fermière
    '',
    // Culture prévue
    '',
    // Justificatif (facture d\'achat ou semences fermières) vu lors de l\'audit ?
    '',
    // Commentaire sur cet ilot/parcelle
    { wch: 40 },
  ]

  sheet_add_aoa(sheet, featureCollection.features.map(({ id, geometry, properties }) => {
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodeCpf(properties.cultures.at(0)?.CPF)

    return [
      // Nom de la parcelle
      properties.NOM ?? '',
      // Ilot
      properties.NUMERO_I ?? '',
      // N° parcelle
      properties.NUMERO_P ?? '',
      // Surface graphique (ha)
      surfaceHa,
      // Date de début de conversion
      properties.engagement_date ? new Date(properties.engagement_date) : '',
      // Précédent\n(année n-1)
      '',
      // Type de culture
      culture?.code_cpf ?? `[ERREUR] culture inconnue`,
      // Liste secondaire
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      // Espèces implantées
      generateAutresInfos([{ properties }], { withName: false, withSurface: true, withVariete: true, withDate: false, withNotes: false, initialCulture: culture?.code_cpf }),
      // Degré de conversion de la parcelle/ilot
      properties.conversion_niveau,
      // Date de semis/implantation
      generateAutresInfos([{ properties }], { withName: false, withSurface: false, withVariete: false, withDate: true, withNotes: false, initialCulture: culture?.code_cpf }),
      // Semence C2/Bio/Conv
      '',
      // Date de dérogation\n(NA si non applicable)
      '',
      // Conformité ?
      '',
      // Type/Nature des ferti/amendements/effluents
      '',
      // Conformité ?
      '',
      // Type/Nature des traitements phytos
      '',
      // Conformité ?
      '',
      // Rendement\n(qté/ha)
      '',
      // Rendement cohérent
      '',
      // Récolte gardée pour semence fermière
      '',
      // Culture prévue
      '',
      // Justificatif (facture d\'achat ou semences fermières) vu lors de l\'audit ?
      '',
      // Commentaire sur cet ilot/parcelle
      properties.auditeur_notes ?? ''
    ]
  }), { origin: 'A8', cellDates: true })

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    const rowIndex = index + 8;

    sheet[`D${rowIndex}`].t = 'n'
    sheet[`D${rowIndex}`].z = '0.00'

    if (sheet[`E${rowIndex}`].v) {
      sheet[`E${rowIndex}`].t = 'd'
      sheet[`E${rowIndex}`].z = 'dd/mm/yyyy'
    }
  })

  // comments
  sheet_add_aoa(sheet, [
    ['Commentaires'],
    [record.audit_notes]
  ], { origin: 'G1'})

  // totals
  const groups = Object.fromEntries(
    getFeatureGroups(featureCollection, GROUPE_NIVEAU_CONVERSION)
      .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
  )

  const totalSurface = (surface(featureCollection) / 10_000)?.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
  sheet_add_aoa(sheet, [
    ['Total C1', groups.CONV?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '0,00', `Total : ${totalSurface} ha`],
    ['Total C2', groups.AB?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '0,00'],
    ['Total C3', groups.C1?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '0,00'],
    ['Total bio', groups.C2?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '0,00'],
    ['Total conv', groups.C3?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '0,00'],
  ], { origin: 'P1'});

  return sheet;
}


class OcaciaExporter extends BaseExporter {
  label = "Tableur"
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({
      featureCollection: this.featureCollection,
      operator: this.operator,
      record: this.record
    })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'Tableau de surfaces')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }

  toClipboard() {
    let sheet = this.getSheet()
    sheet = sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
    // Remove first 7 row, keep first columns A to X
    sheet = sheet.slice(8).map(row => row.slice(0, 21))
    sheet = json_to_sheet(sheet)
    const data = sheet_to_csv(sheet, { FS: '\t' })

    return navigator.clipboard.writeText(data)
  }
}


export default OcaciaExporter;
