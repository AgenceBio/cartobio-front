import { utils } from 'xlsx'
import { fromCodePac } from '@agencebio/rosetta-cultures'
import { surface, GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION, getFeatureGroups } from '@/components/Features/index.js'

import BaseExporter from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa, sheet_to_csv } = utils
const { decode_range: R, sheet_to_json, json_to_sheet } = utils
const cultureCpf = (culture, TYPE) => culture?.libelle_code_cpf ?? `[ERREUR] correspondance manquante avec ${TYPE}`

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
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodePac(props.TYPE)

    return [
      // Commune
      props.COMMUNE_LABEL,
      // Ilot
      `${ilotId}_${parcelleId}`,
      // Culture
      cultureCpf(culture, props.TYPE),
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

    ['E', 'F', 'G', 'H', 'I']
      .filter(col => sheet[`${col}${6 + index}`].v !== '')
      .forEach(col => Object.assign(sheet[`${col}${6 + index}`], { t: 'n', z: '0.00' }))

    if (sheet[`J${6 + index}`].v) {
      sheet[`J${6 + index}`].t = 'd'
      sheet[`J${6 + index}`].z = 'dd/mm/yyyy'
    }
  })

  // Totaux par niveau de conversion
  const groups = Object.fromEntries(
    getFeatureGroups(featureCollection, GROUPE_NIVEAU_CONVERSION)
      .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
  )

  sheet_add_aoa(sheet, [
    ['',          'AB',           'C1',             'C2',               'C3',             'C0',                 'Total'],
    ['TOTAUX :',  groups.AB ?? 0, groups.C1 ?? 0,    groups.C2 ?? 0,    groups.C3 ?? 0,    groups.CONV ?? 0,    surface(featureCollection) / 10_000],
  ], { origin: 'R4'});

    // Formattage des totaux
  ['S', 'T', 'U', 'V', 'W', 'X']
    .forEach(col => Object.assign(sheet[`${col}5`], sheet[`${col}5`].v ? { t: 'n', z: '0.00' } : { z: '-' }))

  // Totaux par niveau de conversion ET par type de culture
  sheet_add_aoa(sheet, [
    ['Surfaces par culture',],
    ['Culture',                       'Somme de AB',  'Somme de C1',    'Somme de C2',  'Somme de C3',  'Somme de C0'],
  ], { origin: 'R7'})

  getFeatureGroups(featureCollection, GROUPE_CULTURE).forEach(({ key, features }, index) => {
    const culture = fromCodePac(key)
    const groups = Object.fromEntries(
      getFeatureGroups({ type: 'FeatureCollection', features }, GROUPE_NIVEAU_CONVERSION)
        .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
    )

    sheet_add_aoa(sheet, [
      [cultureCpf(culture, key),   groups.AB ?? 0,  groups.C1 ?? 0, groups.C2 ?? 0, groups.C3 ?? 0, groups.CONV ?? 0],
    ], { origin: `R${9 + index}`});

    // Formattage des totaux
    ['S', 'T', 'U', 'V', 'W']
      .filter(col => sheet[`${col}${9 + index}`].v !== 0)
      .forEach(col => Object.assign(sheet[`${col}${9 + index}`], { t: 'n', z: '0.00' }))
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
    return new Blob([sheet_to_csv(sheet, { FS: ';' })])
  }

  toClipboard() {
    let sheet = this.getSheet()
    sheet = sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
    // Remove first 5 rows, keep first columns A to J
    sheet = sheet.slice(5).map(row => row.slice(0, 10))
    sheet = json_to_sheet(sheet)
    let data = sheet_to_csv(sheet, { FS: '\t' })

    return navigator.clipboard.writeText(data)
  }
}


export default CertipaqExporter;
