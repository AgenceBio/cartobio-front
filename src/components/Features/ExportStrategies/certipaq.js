import { utils } from 'xlsx'
import { fromCodePac } from '@/referentiels/cpf.js'
import { surface, GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION, getFeatureGroups } from '@/components/Features/index.js'

const { book_new, aoa_to_sheet, sheet_add_aoa, book_append_sheet } = utils
const { decode_range: R } = utils

export default ({ featureCollection, operator }) => {
  const workbook = book_new()
  const today = new Date().toLocaleDateString('fr-FR', {
    dateStyle: 'short',
    timeZone: 'Europe/Paris'
  })

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    // A1: B1
    ['N° de l\'opérateur', operator.numeroBio],
    // A2: B2
    ['Date de saisie :', today],
  ], { cellDates: true })

  sheet['B1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.id}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  sheet['B2'].t = 'd'
  sheet['B2'].z = 'dd/mm/yyyy'

  sheet['!merges'] = [
    R('F4:J4'), R('O4:P4'),
  ]

  sheet['!cols'] = [
    // parcelleId
    { wch: 12 },
    // Commune
    { wch: 16 },
    // Ilot
    { wch: 7 },
    // Culture
    { wch: 40 },
    // Variété/infos
    { wch: 16 },
    // C0 - AB - C1 - C2 - C3
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    // Date Conv
    { wch: 10 },
    // Observation
    { wch: 40 },
    // Précédent - Anté précédent
    { wch: 10 }, { wch: 10 },
    // Produit - Date
    { wch: 10 }, { wch: 10 },
    // [ blank ]
    '',
    // Totaux - AB - C1 - C2 - C3 - C0 - Total
    { wch: 40 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 8 }
  ]

  // First sheet: plots informations (via `featureCollection`)
  sheet_add_aoa(sheet, [
    ['',                     '',        '',     '',        '',                'Surfaces en ha', '', '', '', '', '',          '',                            '',          '',               'Dernier intrant non autorisé en AB', ''],
    ['Id. CartoBio', 'Commune', 'Ilot', 'Culture', 'Variété / infos', 'C0', 'AB', 'C1', 'C2', 'C3',     'Date conv', 'Observation / date de semis', 'Précédent', 'Anté précédent', 'Produit', 'Date'],
  ], { origin: 'A4'})

  sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = [props.NUMERO_I, props.NUMERO_P]
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodePac(props.TYPE)

    return [
      // ParcelleId
      id,
      // Commune
      props.COMMUNE_LABEL,
      // Ilot
      `${ilotId}_${parcelleId}`,
      // Culture
      culture.libelle_code_cpf_bio,
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
    ]
  }), { origin: 'A6', cellDates: true })

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    ['F', 'G', 'H', 'I', 'J']
      .filter(col => sheet[`${col}${6 + index}`].v !== '')
      .forEach(col => Object.assign(sheet[`${col}${6 + index}`], { t: 'n', z: '0.00' }))

    sheet[`K${6 + index}`].t = 'd'
    sheet[`K${6 + index}`].z = 'dd/mm/yyyy'
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
      [culture.libelle_code_cpf_bio,   groups.AB ?? 0,  groups.C1 ?? 0, groups.C2 ?? 0, groups.C3 ?? 0, groups.CONV ?? 0],
    ], { origin: `R${9 + index}`});

    // Formattage des totaux
    ['S', 'T', 'U', 'V', 'W']
      .filter(col => sheet[`${col}${9 + index}`].v !== 0)
      .forEach(col => Object.assign(sheet[`${col}${9 + index}`], { t: 'n', z: '0.00' }))
  })

  // First sheet: finalize
  book_append_sheet(workbook, sheet, 'Parcellaire bio');

  return workbook
}