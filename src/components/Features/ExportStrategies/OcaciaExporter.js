import { utils, write } from 'xlsx'
import { fromCodePac } from '@agencebio/rosetta-cultures'
import { surface } from '@/components/Features/index.js'

import BaseExporter from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, book_append_sheet, book_new, sheet_to_csv } = utils
const cultureCpf = (culture, TYPE) => culture?.libelle_code_cpf ?? `[ERREUR] correspondance manquante avec ${TYPE}`

const getSheet = ({ featureCollection, operator }) => {
  const sheet = aoa_to_sheet(featureCollection.features.map(({ geometry, properties: props, id }) => {
    const [ilotId, parcelleId] = [props.NUMERO_I, props.NUMERO_P]
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodePac(props.TYPE)

    return [
      // Commune
      props.COMMUNE_LABEL,
      // Ilot
      `${ilotId}.${parcelleId}`,
      // Culture
      cultureCpf(culture, props.TYPE),
      // N° Cadastre
      props.cadastre,
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
  }))

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    ['F', 'G', 'H', 'I', 'J']
        .filter(col => sheet[`${col}${index + 1}`].v !== '')
        .forEach(col => sheet[`${col}${index + 1}`].w = sheet[`${col}${index + 1}`].v.toString().replace('.', ','))

    if (sheet[`K${index + 1}`].v) {
      sheet[`K${index + 1}`].t = 'd'
      sheet[`K${index + 1}`].z = 'dd/mm/yyyy'
    }
  })

  return sheet;
}


class OcaciaExporter extends BaseExporter {
  label = "Tableur"
  extension = 'xlsx'
  mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  getSheet() {
    return getSheet({ featureCollection: this.featureCollection, operator: this.operator } )
  }

  toFileData() {
    const sheet = this.getSheet()
    const workbook = book_new()
    book_append_sheet(workbook, sheet, 'Parcellaire')

    return new Blob([write(workbook, { bookType: this.extension, type: 'array' })], { type: this.mimetype })
  }

  toClipboard() {
    const sheet = this.getSheet()
    const data = sheet_to_csv(sheet, { FS: '\t' })
    return navigator.clipboard.writeText(data)
  }
}


export default OcaciaExporter;
