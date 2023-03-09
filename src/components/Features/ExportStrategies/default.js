import { utils } from 'xlsx'
import { libelléFromCode } from '@/referentiels/pac.js'
import { surface, inHa } from '@/components/Features/index.js'

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
    ['Numéro bio :', '', operator.numeroBio, '', 'Nom Opérateur:', operator.nom],
    ['Date de saisie :', '', today, '', 'N°PACAGE', operator.numeroPacage],
    ['Surface graphique totale (en ha) :', '', inHa(surface(featureCollection))]
  ], { cellDates: true })

  sheet['C1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.id}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  sheet['C2'].t = 'd'
  sheet['C2'].z = 'dd/mm/yyyy'
  sheet['C2'].v = today

  sheet['!merges'] = [
    R('A1:B1'), R('C1:D1'), R('F1:K1'),
    R('A2:B2'), R('C2:D2'),
    R('A3:B3'), R('C3:D3'),
  ]

  sheet['!cols'] = [
    { wch: 16 }, '', '', '', {wch: 16},
    { wch: 40 }, { wch: 10 }, '', { wch: 10 }, '', { wch: 60 }, { wch: 60 }
  ]

  // First sheet: plots informations (via `featureCollection`)
  sheet_add_aoa(sheet, [
    ['Identifiant CartoBio', 'N°Ilot', 'N°Parcelle', 'Surfaces graphique (ha)', 'Code culture', 'Libellé culture', 'PACAGE', 'Niveau de conversion', 'Date de conversion', 'Pac / Hors Pac / Cueillette', 'Commentaire agriculteur', 'Notes d\'audit'],
  ], { origin: 'A6'})

  sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = [props.NUMERO_I, props.NUMERO_P]
    const label = props.TYPE_LIBELLE ?? libelléFromCode(props.TYPE)
    const surfaceHa = surface(geometry) / 10_000
    const isPac = Boolean(props.PACAGE)
    const culture = props.TYPE

    return [
      id,
      ilotId,
      parcelleId,
      surfaceHa,
      culture,
      label,
      props.PACAGE,
      props.conversion_niveau,
      props.engagement_date,
      (isPac ? 'PAC' : ''),
      props.commentaires ?? '',
      props.auditeur_notes ?? ''
    ]
  }), { origin: 'A7', cellDates: true })

  // First sheet: finalize
  book_append_sheet(workbook, sheet, 'Parcellaire bio');

  return workbook
}
