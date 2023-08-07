import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { cultureLabels, surface } from '@/components/Features/index.js'
import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { book_new, aoa_to_sheet, sheet_add_aoa, book_append_sheet } = utils
const { decode_range: R } = utils

const getSheet = ({ featureCollection, operator }) => {
  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = aoa_to_sheet([
    ['Numéro bio :', '', operator.numeroBio, '', 'Nom Opérateur:', operator.nom],
    ['Date de saisie :', '', new Date(), '', 'N°PACAGE', operator.numeroPacage],
    ['Surface graphique totale (en ha) :', '', surface(featureCollection) / 10_000]
  ], { cellDates: true })

  sheet['C1'].l = { Target: `https://annuaire.agencebio.org/fiche/${operator.numeroBio}`, Tooltip: `https://annuaire.agencebio.org/fiche/${operator.id}` }
  sheet['C1'].t = 's'
  sheet['C2'].t = 'd'
  sheet['C2'].z = 'dd/mm/yyyy'
  sheet['C3'].t = 'n'
  sheet['C3'].z = '0.00'

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
    const firstCulture = props.cultures.at(0)
    const label = firstCulture?.TYPE_LIBELLE ?? fromCodeCpf(firstCulture?.CPF)?.libelle_code_cpf ?? ''
    const surfaceHa = surface(geometry) / 10_000
    const isPac = Boolean(props.PACAGE)
    const culture = firstCulture.CPF ?? firstCulture.TYPE ?? ''

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
      generateAutresInfos([ { id, geometry, properties: props }], { withName: false, withNotes: false }),
      props.auditeur_notes ?? ''
    ]
  }), { origin: 'A7', cellDates: true })

  // Formatting cells
  featureCollection.features.forEach((feature, index) => {
    Object.assign(sheet[`A${7 + index}`], { t: 's' })
    // surface is a 2 digits figure
    Object.assign(sheet[`D${7 + index}`], { t: 'n', z: '0.00' })
  })

  return sheet
}

class DefaultExporter extends BaseExporter {
  label = 'Excel'
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator })
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'Parcellaire bio')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }
}

export default DefaultExporter;
