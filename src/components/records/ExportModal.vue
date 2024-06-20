<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-road-map-line" data-track-content data-content-name="Modale d'export">
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
              <button class="fr-btn fr-icon-table-line fr-btn--secondary" @click="ocExport" data-content-piece="Export OC" ref="autofocusedElement">
                {{ exporter.label }}&nbsp;<small>(<code :aria-label="exporter.label">.{{
                  exporter.extension
                }}</code>)</small>
              </button>
            </div>
            <div class="fr-col" v-if="exporter.toClipboard">
              <button class="fr-btn fr-btn--secondary" :class="{'fr-icon-check-line': copied, 'fr-icon-clipboard-line': !copied}" @click="ocClipboardExport" data-content-piece="Export presse-papier">
                Copier dans le presse-papier
              </button>
            </div>
          </div>
        </li>
        <li>
          <button class="fr-btn fr-icon-france-line fr-btn--secondary" @click="geojsonExport" data-content-piece="Export GeoJson">
            GeoJSON&nbsp;<small>(<code aria-label="Extension de fichier .geojson">.geojson</code>)</small>
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { computed, ref, toRaw } from 'vue'
import { fromId } from '@/utils/exports.js'
import { useFocus } from '@vueuse/core'
import Modal from '@/components/widgets/Modal.vue'
import { usePermissions } from '@/stores/permissions.js'
import { statsPush } from "@/stats.js"

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  collection: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})

const permissions = usePermissions()
const organismeCertificateurId = computed(() => props.operator.organismeCertificateur.id)
const filenameBase = computed(() => `parcellaire-operateur-${props.operator.numeroBio}`)
const exporter = computed(function () {
  const exporterClass = fromId(organismeCertificateurId.value)
  return new exporterClass({
    featureCollection: props.collection,
    operator: props.operator,
    record: props.record,
    permissions
  })
})
const copied = ref(false)
const autofocusedElement = ref()
useFocus(autofocusedElement, { initialValue: true })

function geojsonExport() {
  statsPush(['trackEvent', 'Export', 'Export GeoJSON'])
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
  statsPush(['trackEvent', 'Export', `Export OC (${props.operator.organismeCertificateur.nom})`])
  const data = exporter.value.toFileData()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(data)
  link.download = `${filenameBase.value}.${exporter.value.extension}`
  link.mime = exporter.value.mime
  link.click()
}

function ocClipboardExport () {
  statsPush(['trackEvent', 'Export', `Export presse-papier (${props.operator.organismeCertificateur.nom})`])
  exporter.value.toClipboard()
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
