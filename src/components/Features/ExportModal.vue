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
          <button class="fr-btn fr-icon-table-line fr-btn--secondary" @click="ocExport">
              {{ strategy.label }}&nbsp;<small>(<code :aria-label="strategy.label">.{{ strategy.extension }}</code>)</small>
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
import { fromId } from './ExportStrategies/index.js'

import Modal from '@/components/Modal.vue'

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
const organismeCertificateurId = computed(() => props.operator.organismeCertificateur.id)
const filenameBase = computed(() => `parcellaire-operateur-${props.operator.numeroBio}`)
const strategy = computed(() => fromId(organismeCertificateurId.value))

function geojsonExport() {
  const blob = new Blob(
    [JSON.stringify(toRaw(props.collection), null, 2)],
    { type: 'application/json'}
  )

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filenameBase.value}.json`
  link.click()
}

function ocExport () {
  const strategy = fromId(organismeCertificateurId.value)
  const data = strategy({
    featureCollection: props.collection,
    operator: props.operator
  })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(data)
  link.download = `${filenameBase.value}.${strategy.extension}`
  link.mime = strategy.mime
  link.click()
}
</script>
