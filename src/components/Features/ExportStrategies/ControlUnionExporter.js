import BaseExporter from "@/components/Features/ExportStrategies/BaseExporter.js";
import { utils, write } from "xlsx";
import { surface } from "@/components/Features/index.js"
import { fromCodeCpf } from "@agencebio/rosetta-cultures"

const getSheet = ({ featureCollection, operator }) => {
  const notification = operator.notifications.find(({ status }) => status === 'ACTIVE') ?? operator.notifications.at(0)

  // First sheet
  // First sheet: customer informations (via `customer`)
  const sheet = utils.aoa_to_sheet([
    ['Raison sociale :', notification.name ?? '', 'Date de l\'audit :', ''],
  ])

  utils.sheet_add_aoa(sheet, [
    [],
    ['Suivi parcelles'],
    [],
    ['N° PACAGE :'],
    [
      'Identification (références cadastrales)',
      'Production',
      'Quantité',
      'Date de début de conversion',
      'Niveau de la parcelle au jour de l\'audit (C1'
    ],
  ], { origin: 'A2' })

  sheet['!merges'] = [
    utils.decode_range('A3:E3')
  ]

  utils.sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props }) => {
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodeCpf(props.CPF)

    return [
      '',
      culture?.libelle_code_cpf,
      surfaceHa,
      props.engagement_date ? new Date(props.engagement_date) : '',
      props.niveau_conversion
    ]
  }), { origin: 'A7' })

  return sheet
}

class ControlUnionExporter extends BaseExporter {
  label = "Tableur"
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator } )
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
