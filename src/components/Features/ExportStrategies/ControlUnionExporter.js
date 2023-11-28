import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";
import { utils, write } from "xlsx";
import { surface } from "@/components/Features/index.js"
import { fromCodeCpf } from "@agencebio/rosetta-cultures"

const getSheet = ({ featureCollection, operator, permissions }) => {
  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = utils.aoa_to_sheet([
    ['Raison sociale :', operator.nom, 'Date de l\'audit :', ''],
  ])

  utils.sheet_add_aoa(sheet, [
    [],
    ['Suivi parcelles'],
    [],
    ['N° PACAGE :', operator.numeroPacage ?? ''],
    [
      'Identification (références cadastrales)',
      'Production',
      'Quantité',
      'Date de début de conversion',
      'Niveau de la parcelle au jour de l\'audit (C1/C2/C3/AB)',
      'Autres infos',
      'Id. Parcelle',
      'Code culture'
    ],
  ], { origin: 'A2' })

  sheet['!cols'] = [
    // ref cadastrale
    { wch: 16 },
    // Production
    { wch: 40 },
    // Surface / Quantité
    { wch: 16 },
    // Date de début de conversion
    { wch: 12 },
    // Niveau de conversion
    { wch: 8 },
    // Autres infos,
    { wch: 40 },
    // Id. Parcelle #G
    { wch: 16 },
    // Code culture (CPF) #H
    { wch: 16 }
  ]

  sheet['!merges'] = [
    utils.decode_range('A3:E3')
  ]

  utils.sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props }) => {
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodeCpf(props.cultures.at(0)?.CPF)

    return [
      props.cadastre,
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      surfaceHa,
      props.engagement_date ? new Date(props.engagement_date) : '',
      props.conversion_niveau,
      generateAutresInfos([{ properties: props }], { withAnnotations: true, initialCulture: culture?.code_cpf, permissions }),
      String(props.id),
      culture?.code_cpf
    ]
  }), { origin: 'A7', cellDates: true })

  // Formattage des cellules
  featureCollection.features.forEach((feature, index) => {
    sheet[`G${7 + index}`].t = 's';
  })

  return sheet
}

class ControlUnionExporter extends BaseExporter {
  label = "Tableur"
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  range = 'A6:H999'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator, permissions: this.permissions } )
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Suivi parcelles')
    return new Blob([write(workbook, { type: 'array', bookType: this.extension })])
  }

  toClipboard() {
    const sheet = this.getSheet()
    const data = utils.sheet_to_csv(sheet, { FS: '\t' })
    return navigator.clipboard.writeText(data)
  }
}

export default ControlUnionExporter
