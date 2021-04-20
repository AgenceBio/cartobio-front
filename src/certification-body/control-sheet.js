import { fromCode } from '@/modules/codes-cultures/pac.js'
import { geometry as area } from '@mapbox/geojson-area'
import XLSX from 'xlsx'

const {decode_range: R} = XLSX.utils
const IN_HECTARES = 10000

export function toCertificationBodySheet ({ featureCollection, operator, template, format:bookType }) {
  const wb = template({ featureCollection, operator })

  return (filename) => XLSX.writeFile(wb, filename, { bookType })
}

export function ecocertExcelTemplate ({ featureCollection, operator }) {
  const wb = XLSX.utils.book_new()

  // First sheet
  // First sheet: customer informations (via `customer`)
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['N°Opérateur:', '', operator.customerId, '', 'Nom Opérateur:', '', operator.name, '', '', '', '', '', 'N°PACAGE', operator.pacage],
    ['Date de saisie:', '', operator.inputDate, '', '', '', 'Extrait par:', '', operator.certifiedBy],
  ], { cellDates: true })

  ws1['C1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.id}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  ws1['C2'].t = 'd'
  ws1['C2'].z = 'dd/mm/yyyy'
  ws1['C2'].v = operator.inputDate

  ws1['!merges'] = [
    R('A1:B1'), R('C1:D1'), R('E1:F1'), R('G1:L1'),
    R('A2:B2'), R('C2:D2'), R('G2:H2')
  ]

  // First sheet: plots informations (via `featureCollection`)
  XLSX.utils.sheet_add_aoa(ws1, [
    ['', '', '', '', 'Partie réservée à Ecocert'],
    ['Ilots', 'Parcelles', 'Surfaces (ha)', 'Codes', 'Nomenclature Pac', 'Ilot.Parcelle', 'Cultures', 'Variétés/Association/Précision', 'Code Pac', 'Culture/variété/Complément', 'Surfaces', 'Classification Parcelle', 'Date de conversion', 'Classification Parcelle 2', 'Proposition Classification Culture', 'Pac / Hors Pac / Cueillette', 'Commentaire',	'Parcelles menées en Bio selon déclaration PAC'],
  ], { origin: 'A4'})

  ws1['!merges'].push(
    R('E4:R4')
  )

  XLSX.utils.sheet_add_aoa(ws1, featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = id.split('.')
    const {label, groupLabel} = fromCode(props.culture_type)
    const surface = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)
    const isPac = Boolean(operator.pacage)
    const isBio = ['BIO', 'C1', 'C2', 'C3'].includes(props.niveau_conversion)
    const cultures = props.culture_type.join(' - ')

    return [ilotId, parcelleId, surface, cultures, label, id, groupLabel, '', cultures, '', surface, props.niveau_conversion, props.engagement_date, '', '', (isPac ? 'PAC' : ''), '', (isPac && isBio ? 'Oui' : '')]
  }), { origin: 'A6', cellDates: true })

  // First sheet: finalize
  XLSX.utils.book_append_sheet(wb, ws1, 'Import Télépac');

  return wb
}

export function basicExcelTemplate ({ featureCollection, operator }) {
  const wb = XLSX.utils.book_new()

  // First sheet
  // First sheet: customer informations (via `customer`)
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['N°Bio:', '', operator.id, '', 'Nom Opérateur:', '', operator.name],
    ['Date de saisie:', '', operator.inputDate, '', 'N°PACAGE', '', operator.pacage],
  ], { cellDates: true })

  ws1['C1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.id}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  ws1['C2'].t = 'd'
  ws1['C2'].z = 'dd/mm/yyyy'
  ws1['C2'].v = operator.inputDate

  ws1['!merges'] = [
    R('A1:B1'), R('C1:D1'), R('E1:F1'), R('G1:L1'),
    R('A2:B2'), R('C2:D2'), R('E2:F2')
  ]

  // First sheet: plots informations (via `featureCollection`)
  XLSX.utils.sheet_add_aoa(ws1, [
    [],
    ['N°Ilot', 'N°Parcelle', 'Surfaces (ha)', 'Codes', 'Nomenclature Pac', 'Ilot.Parcelle', 'Cultures', 'Variétés/Association/Précision', 'Code Pac', 'Culture/variété/Complément', 'Surfaces', 'Classification Parcelle', 'Date de conversion', 'Pac / Hors Pac / Cueillette', 'Commentaire',	'Parcelles menées en Bio selon déclaration PAC'],
  ], { origin: 'A4'})

  XLSX.utils.sheet_add_aoa(ws1, featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = id.split('.')
    const {label, groupLabel} = fromCode(props.culture_type)
    const surface = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)
    const isPac = Boolean(operator.pacage)
    const isBio = ['BIO', 'C1', 'C2', 'C3'].includes(props.niveau_conversion)
    const cultures = props.culture_type.join(' - ')

    return [ilotId, parcelleId, surface, cultures, label, id, groupLabel, '', cultures, '', surface, props.niveau_conversion, props.engagement_date, (isPac ? 'PAC' : ''), '', (isPac && isBio ? 'Oui' : '')]
  }), { origin: 'A6', cellDates: true })

  // First sheet: finalize
  XLSX.utils.book_append_sheet(wb, ws1, 'Parcellaire Bio');

  return wb
}
