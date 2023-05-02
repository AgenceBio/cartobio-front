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
          <div class="fr-grid-row">
            <div class="fr-col" v-if="exporter.toFileData">
              <button class="fr-btn fr-icon-table-line fr-btn--secondary" @click="ocExport">
                {{ exporter.label }}&nbsp;<small>(<code :aria-label="exporter.label">.{{
                  exporter.extension
                }}</code>)</small>
              </button>
            </div>
            <div class="fr-col" v-if="exporter.toClipboard">
              <button class="fr-btn fr-btn--secondary" :class="{'fr-icon-check-line': copied, 'fr-icon-clipboard-line': !copied}" @click="ocClipboardExport">
                Copier dans le presse-papier
              </button>
            </div>
          </div>
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
import { computed, ref, toRaw } from 'vue'
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
const exporter = computed(function () {
  let exporterClass = fromId(organismeCertificateurId.value)
  return new exporterClass({
    featureCollection: props.collection,
    operator: props.operator
  })
})
const copied = ref(false)

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
  const data = exporter.value.toFileData()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(data)
  link.download = `${filenameBase.value}.${exporter.value.extension}`
  link.mime = exporter.value.mime
  link.click()
}

function ocClipboardExport () {
  exporter.value.toClipboard()
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
