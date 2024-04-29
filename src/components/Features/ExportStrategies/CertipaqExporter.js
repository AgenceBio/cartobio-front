import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import {
  cultureLabel,
  featureName,
  getFeatureGroups,
  GROUPE_CULTURE,
  GROUPE_NIVEAU_CONVERSION,
  legalProjectionSurface
} from '@/components/Features/index.js'

import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa } = utils
const { decode_range: R } = utils

function getSheet () {
  const { featureCollection, operator, permissions } = this
  const notification = operator.notifications?.find(({ status }) => status === 'ACTIVE') ?? {}

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    // A1: B1
    ['N° de l\'opérateur', notification?.numeroClient ?? ''],
    // A2: B2
    ['Date de saisie :', new Date()],
  ], { cellDates: true })

  sheet['B1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.numeroBio}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.numeroBio}` }
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
    // Id. Parcelle
    { wch: 16 },
    // Code culture
    '',
    // [ blank ]
    '',
    // Totaux - AB - C1 - C2 - C3 - C0 - Total
    { wch: 40 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 8 }
  ]

  // First sheet: plots informations (via `featureCollection`)
  sheet_add_aoa(sheet, [
    [       '',     '',        '',                '', 'Surfaces en ha', '',   '',   '',     '',          '',                            '',          '',               '', 'Dernier intrant non autorisé en AB',     '',             '',             ''],
    ['Commune', 'Ilot', 'Culture', 'Variété / infos', 'C0',           'AB', 'C1', 'C2',   'C3', 'Date conv', 'Observation / date de semis', 'Précédent', 'Anté précédent',                            'Produit', 'Date', 'Id. Parcelle', 'Code culture'],
  ], { origin: 'A4'})

  const ilotOptions = {
    explicitName: false,
    ilotLabel: '',
    parcelleLabel: '',
    separator: '_',
    placeholder: ''
  }

  sheet_add_aoa(sheet, this.getSortedFeatures().map((feature) => {
    const { geometry, properties: props, id } = feature
    const surfaceHa = (legalProjectionSurface(feature) / 10_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    const culture = props.cultures?.at(0) ? fromCodeCpf(props.cultures?.at(0).CPF) : { libelle_code_cpf: '[ERREUR] culture absente' }

    return [
      // Commune          #A
      props.COMMUNE_LABEL,
      // Ilot             #B
      featureName({ properties: props }, ilotOptions),
      // Libellé Culture  #C
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue (${props.cultures?.at(0).CPF})`,
      // Variété / infos  #D
      generateAutresInfos([{ id, geometry, properties: props }], { withCode: false, withDate: false, withExplicitName: true, withName: false, withNotes: true, withSurface: false, withVariete: true, initialCulture: culture?.code_cpf }),
      // C0 - AB - C1 - C2 - C3
      props.conversion_niveau === 'CONV' ? surfaceHa : '',
      props.conversion_niveau === 'AB' ? surfaceHa : '',
      props.conversion_niveau === 'C1' ? surfaceHa : '',
      props.conversion_niveau === 'C2' ? surfaceHa : '',
      props.conversion_niveau === 'C3' ? surfaceHa : '',
      // Date conv
      props.engagement_date ? new Date(props.engagement_date) : '',
      // Observation / date de semis #K
      generateAutresInfos([{ id, geometry, properties: props }], { withAnnotations: true, withDate: true, withName: false, withNotes: false, withSurface: true, withVariete: false, initialCulture: culture?.code_cpf, permissions }),
      // Précédent
      '',
      // Anté précédent
      '',
      // Produit
      '',
      // Date
      '',
      // Id. Parcelle #P
      String(id),
      // Code culture (CPF) #Q
      culture?.code_cpf,
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
      .map(({ key, features }) => ([key, legalProjectionSurface(features) / 10_000]))
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
      (legalProjectionSurface(featureCollection) / 10_000)?.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    ],
  ], { origin: 'S4'});

  // Totaux par niveau de conversion ET par type de culture
  sheet_add_aoa(sheet, [
    ['Surfaces par culture',],
    ['Culture',                       'Somme de AB',  'Somme de C1',    'Somme de C2',  'Somme de C3',  'Somme de C0'],
  ], { origin: 'S7'})

  getFeatureGroups(featureCollection, GROUPE_CULTURE).forEach(({ key, features }, index) => {
    const culture = fromCodeCpf(key)
    const groups = Object.fromEntries(
      getFeatureGroups({ type: 'FeatureCollection', features }, GROUPE_NIVEAU_CONVERSION)
        .map(({ key, features }) => ([key, legalProjectionSurface(features) / 10_000]))
    )

    sheet_add_aoa(sheet, [[
      cultureLabel(culture),
      groups.AB?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C1?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C2?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.C3?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
      groups.CONV?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0
    ]], { origin: `S${9 + index}`});
  })

  return sheet;
}


class CertipaqExporter extends BaseExporter {
  label = "Tableur"
  extension = "csv"
  mimetype = "text/csv"
  range = "A5:Q999"

  getSheet = getSheet

  toFileData() {
    const sheet = this.getSheet()
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Export Certipaq')
    // Cette fonction ajoute un BOM ce que sheet_to_csv ne fait pas
    const data = write(workbook, { type: "array", bookType: 'csv', FS: ';' })
    return new Blob([data])
  }
}


export default CertipaqExporter;
