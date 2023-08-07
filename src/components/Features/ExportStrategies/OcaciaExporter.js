import { utils, write } from 'xlsx'
import { fromCodeCpf } from '@agencebio/rosetta-cultures'
import { GROUPE_NIVEAU_CONVERSION, featureName, getFeatureGroups, surface } from '@/components/Features/index.js'

import BaseExporter, { generateAutresInfos } from "@/components/Features/ExportStrategies/BaseExporter.js";

const { aoa_to_sheet, sheet_add_aoa, book_append_sheet, book_new } = utils
const { decode_range: R, sheet_to_csv } = utils

const getSheet = ({ featureCollection }) => {
  const sheet = aoa_to_sheet([
    [''       ,     '',        '',            '',                '', 'Surfaces en ha', '', '', '', '',      '',          '',                            '',          '', 'Dernier intrant non autorisé en AB',  '',        ''],
    [''       ,     '',        '',            '',                '', '0',   '0',  '0',  '0',  '0',          '',          '',                            '',          '',                                   '',  '',        ''],
    ['Commune', 'Ilot', 'Culture', 'N° Cadastre', 'Variété / infos', 'C0', 'AB', 'C1', 'C2', 'C3', 'Date conv', 'Observation', 'Précédent', 'Anté précédent', 'Produit',                               'Date', 'Id. CartoBio'],
  ])

  sheet['!merges'] = [
    R('F1:H1'), R('O1:P2'),
  ]

  sheet['!cols'] = [
    // Commune
    { wch: 16 },
    // Ilot
    { wch: 12 },
    // Culture
    { wch: 40 },
    // N° Cadastre
    { wch: 16 },
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
    { wch: 24 },
  ]

  sheet_add_aoa(sheet, featureCollection.features.map(({ id, geometry, properties: props }) => {
    const surfaceHa = surface(geometry) / 10_000
    const culture = fromCodeCpf(props.cultures.at(0)?.CPF)

    return [
      // Commune
      props.COMMUNE_LABEL,
      // Ilot
      featureName({ properties: props }, { ilotLabel: '', parcelleLabel: '', separator: '.', placeholder: '' }),
      // Culture
      culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue`,
      // N° Cadastre
      props.cadastre,
      // Variété / infos
      generateAutresInfos([ { id, geometry, properties: props }], { withName: false, withNotes: false }),
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
      // Feature ID
      props.id
    ]
  }), { origin: 'A4', cellDates: true })

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    const rowIndex = index + 4;

    ['F', 'G', 'H', 'I', 'J']
        .filter(col => sheet[`${col}${rowIndex}`].v !== '')
        .forEach(col => sheet[`${col}${rowIndex}`].w = sheet[`${col}${rowIndex}`].v.toString().replace('.', ','))

    if (sheet[`K${rowIndex}`].v) {
      sheet[`K${rowIndex}`].t = 'd'
      sheet[`K${rowIndex}`].z = 'dd/mm/yyyy'
    }

    // the id is always displayed as a string
    sheet[`Q${rowIndex}`].t = 's'
  })

  // totals
  const groups = Object.fromEntries(
    getFeatureGroups(featureCollection, GROUPE_NIVEAU_CONVERSION)
      .map(({ key, features }) => ([key, surface({ type: 'FeatureCollection', features }) / 10_000]))
  )

  sheet_add_aoa(sheet, [[
    groups.CONV?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
    groups.AB?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
    groups.C1?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
    groups.C2?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
    groups.C3?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? 0,
  ]], { origin: 'F2'})

  sheet['I1'].v = (surface(featureCollection) / 10_000)?.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

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
