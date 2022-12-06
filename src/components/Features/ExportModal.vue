<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-road-map-line">
    <template #title>Export de parcellaire</template>

    <p>
      Réutilisez vos données dans
      d'autres applications sans avoir à les recopier.
    </p>

    <p>
      Choisissez un format qui vous semble adapté à votre usage.
    </p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--icon-left">
        <li>
          <button class="fr-btn fr-icon-table-line fr-btn--secondary" @click="excelExport">
            Excel&nbsp;<small>(<code aria-label="Extension de fichier .xlsx">.xlsx</code>)</small>
          </button>
        </li>
        <li>
          <button class="fr-btn fr-icon-france-line fr-btn--secondary" @click="geojsonExport">
            GeoJSON&nbsp;<small>(<code aria-label="Extension de fichier .geojson">.geojson</code>)</small>
          </button>
        </li>
        <li class="fr-mt-5w">
          <p class="fr-mb-0 fr-ml-1w">
            <span class="fr-icon fr-icon--sm fr-icon-information-line" aria-hidden="true" />
            Bientôt disponible
          </p>
          <button class="fr-btn fr-icon-france-line fr-btn--secondary" disabled>
            Shapefile&nbsp;<small>(<code aria-label="Extension de fichier .shp">.shp</code>)</small>
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { computed, toRaw } from 'vue'
import { utils, writeFile } from 'xlsx'
import { libelléFromCode } from '@/referentiels/pac.js'
import { surface, inHa } from '@/components/Features/index.js'

import Modal from '@/components/Modal.vue'

const { book_new, aoa_to_sheet, sheet_add_aoa, book_append_sheet } = utils
const { decode_range: R } = utils

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  collection: {
    type: Object,
    required: true
  }
})

const numeroBio = computed(() => props.operator.numeroBio)

function geojsonExport() {
  const blob = new Blob(
    [JSON.stringify(toRaw(props.collection), null, 2)],
    { type: 'application/json'}
  )

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `parcellaire-operateur-${numeroBio.value}.json`
  link.click()
}

function excelExport ({ filename = `parcellaire-operateur-${numeroBio.value}.xlsx` , template = 'user' }) {
  const workbook = excelTemplates[template]({
    featureCollection: props.collection,
    operator: props.operator
  })

  return writeFile(workbook, filename, { bookType : 'xlsx' })
}

const excelTemplates = {
  user: ({ featureCollection, operator }) => {
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
      { wch: 40 }, { wch: 10 }, '', { wch: 10 }, '', { wch: 60 }
    ]

    // First sheet: plots informations (via `featureCollection`)
    sheet_add_aoa(sheet, [
      ['Identifiant CartoBio', 'N°Ilot', 'N°Parcelle', 'Surfaces graphique (ha)', 'Code culture', 'Libellé culture', 'PACAGE', 'Niveau de conversion', 'Date de conversion', 'Pac / Hors Pac / Cueillette', 'Commentaire'],
    ], { origin: 'A6'})

    sheet_add_aoa(sheet, featureCollection.features.map(({ geometry, properties: props, id }) => {
      const [ilotId, parcelleId] = [props.NUMERO_I, props.NUMERO_P]
      const label = props.TYPE_LIBELLE ?? libelléFromCode(props.TYPE)
      const surfaceHa = inHa(surface(geometry))
      const isPac = Boolean(props.PACAGE)
      const culture = props.TYPE

      return [id, ilotId, parcelleId, surfaceHa, culture, label, props.PACAGE, props.conversion_niveau, props.engagement_date, (isPac ? 'PAC' : ''), props.commentaire]
    }), { origin: 'A7', cellDates: true })

    // First sheet: finalize
    book_append_sheet(workbook, sheet, 'Parcellaire Bio');

    return workbook
  }
}
</script>
