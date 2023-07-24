import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { getFeatureGroups, GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION, surface } from '@/components/Features/index.js'

import BaseExporter from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa, sheet_to_csv } = utils
const { decode_range: R, sheet_to_json, json_to_sheet } = utils

const getSheet = ({ featureCollection, operator }) => {
  const notification = operator.notifications.find(({ status }) => status === 'ACTIVE') ?? operator.notifications.at(0)

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    // A1: B1
    ['N° de l\'opérateur', notification.numeroClient ?? ''],
    // A2: B2
    ['Date de saisie :', new Date()],
  ], { cellDates: true })

  sheet['B1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.numeroBio}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  sheet['B1'].t = 's'
  sheet['B2'].t = 'd'
  sheet['B2'].z = 'dd/mm/yyyy'
  delete sheet['B2'].w

  sheet['!merges'] = [
    R('E4:I4'), R('O4:P4'),
  ]

  sheet['!cols'] = [
    // Commune
    { wch: 16 },
    // Ilot
    { wch: 12 },
    // Culture
    { wch: 40 },
    // Variété/infos
    { wch: 16 },
    // C0 - AB - C1 - C2 - C3
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    // Date Conv
    { wch: 12 },
    // Observation
    { wch: 40 },
    // Précédent - Anté précédent
    { wch: 10 }, { wch: 10 },
    // Produit - Date
    { wch: 10 }, { wch: 10 },
    // parcelleId
    { wch: 16 },
    // [ blank ]
    '',
    // Totaux - AB - C1 - C2 - C3 - C0 - Total
    { wch: 40 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 8 }
  ]

  // First sheet: plots informations (via `featureCollection`)
  sheet_add_aoa(sheet, [
    [''       ,     '',        '',        '',                'Surfaces en ha', '', '', '', '', '',          '',                            '',          '',               'Dernier intrant non autorisé en AB',  '',     ''],
    ['Commune', 'Ilot', 'Culture', 'Variété / infos', 'C0', 'AB', 'C1', 'C2', 'C3',     'Date conv', 'Observation / date de semis', 'Précédent', 'Anté précédent', 'Produit',                             'Date', 'Id. CartoBio'],
  ], { origin: 'A4'})

  sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = [props.NUMERO_I, props.NUMERO_P]
    const surfaceHa = (surface(geometry) / 10_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    const culture = fromCodeCpf(props.CPF)

    return [
      // Commune
      props.COMMUNE_LABEL,
      // Ilot
      `${ilotId}_${parcelleId}`,
      // Culture
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      // Variété / infos
      '',
      // C0 - AB - C1 - C2 - C3
      props.conversion_niveau === 'CONV' ? surfaceHa : '',
      props.conversion_niveau === 'AB' ? surfaceHa : '',
      props.conversion_niveau === 'C1' ? surfaceHa : '',
      props.conversion_niveau === 'C2' ? surfaceHa : '',
      props.conversion_niveau === 'C3' ? surfaceHa : '',
      // Date conv
      props.engagement_date ? new Date(props.engagement_date) : '',
      // Observation / date de semis
      props.auditeur_notes ?? '',
      // Précédent
      '',
      // Anté précédent
      '',
      // Produit
      '',
      // Date
      '',
      // ParcelleId
      String(id),
    ]
  }), { origin: 'A6', cellDates: true })

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    sheet[`P${6 + index}`].t = 's';

    if (sheet[`J${6 + index}`].v) {
      sheet[`J${6 + index}`].t = 'd'
      sheet[`J${6 + index}`].z = 'dd/mm/yyyy'
      delete sheet[`J${6 + index}`].w
    }
  })

  // Totaux par niveau de conversion
  const groups = Object.fromEntries(
    getFeatureGroups(featureCollection, GROUPE_NIVEAU_CONVERSION)
      .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
  )

  sheet_add_aoa(sheet, [
    ['', 'AB', 'C1', 'C2', 'C3', 'C0', 'Total'],
    [
      'TOTAUX :',
      groups.AB?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C1?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C2?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C3?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.CONV?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      (surface(featureCollection) / 10_000)?.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    ],
  ], { origin: 'R4'});

  // Totaux par niveau de conversion ET par type de culture
  sheet_add_aoa(sheet, [
    ['Surfaces par culture',],
    ['Culture',                       'Somme de AB',  'Somme de C1',    'Somme de C2',  'Somme de C3',  'Somme de C0'],
  ], { origin: 'R7'})

  getFeatureGroups(featureCollection, GROUPE_CULTURE).forEach(({ key, features }, index) => {
    const culture = fromCodeCpf(key)
    const groups = Object.fromEntries(
      getFeatureGroups({ type: 'FeatureCollection', features }, GROUPE_NIVEAU_CONVERSION)
        .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
    )

    sheet_add_aoa(sheet, [[
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      groups.AB?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C1?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C2?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C3?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.CONV?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0
    ]], { origin: `R${9 + index}`});
  })

  return sheet;
}


class CertipaqExporter extends BaseExporter {
  label = "Tableur"
  extension = "csv"
  mimetype = "text/csv"

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator } )
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Export Certipaq')
    // Cette fonction ajoute un BOM ce que sheet_to_csv ne fait pas
    const data = write(workbook, { type: "array", bookType: 'csv', FS: ';' })
    return new Blob([data])
  }

  toClipboard() {
    let sheet = this.getSheet()
    sheet = sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
    // Remove first 5 rows, keep first columns A to J
    sheet = sheet.slice(5).map(row => row.slice(0, 10))
    sheet = json_to_sheet(sheet)
    const data = sheet_to_csv(sheet, { FS: '\t' })

    return navigator.clipboard.writeText(data)
  }
}


export default CertipaqExporter;
