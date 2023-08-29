<template>
  <component :is="Modal" v-bind="$attrs">
    <template #title>Import des données PAC de {{ télépac.campagne }}</template>

    <div v-if="!collection">
      <p class="fr-text-sm">
        <span class="fr-icon fr-icon-questionnaire-fill fr-mr-1w" aria-hidden />
        Le nom du fichier ressemble à <code>{{ pacageFilename }}</code>
      </p>
    </div>

    <section v-else>
      <p>
        Le fichier proposé contient {{ collection.features.length }} parcelles,
        pour une surface graphique totale de {{ inHa(surface(collection)) }}&nbsp;ha.
      </p>

      <MapPreview :collection="collection" />
    </section>

    <template #footer>
      <ul class="fr-btns-group  fr-btns-group--inline fr-btns-group--icon-left">
        <li v-if="!collection">
          <button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-upload-2-fill" @click="open">
            Sélectionner l'export Télépac au format .zip
          </button>
        </li>
        <li v-else>
          <button class="fr-btn fr-btn--icon-left fr-icon-thumb-up-line" @click="confirmImport">
            Confirmer l'import de ces données
          </button>
        </li>
        <li v-if="collection">
          <button class="fr-btn fr-btn--secondary" @click="reset">
            Annuler et recommencer
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { readonly, ref, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'

import Modal from '@/components/Modal.vue'
import MapPreview from '@/components/Map/Preview.vue'

import { convertShapefileArchiveToGeoJSON } from '@/cartobio-api'
import { surface, inHa } from '@/components/Features/index.js'
import { useTélépac } from '@/referentiels/pac.js'
import { sources } from '@/referentiels/imports.js'

const emit = defineEmits(['upload'])

const collection = ref(null)
const { files, open, reset } = useFileDialog({ multiple: false, accept: '.zip'})
const télépac = useTélépac()
const pacageFilename = readonly(télépac.pacageFilename())

function confirmImport () {
  emit('upload', {
    geojson: collection.value,
    source: sources.TELEPAC,
    metadata: {
      campagne: collection.value.features.at(0)?.properties?.CAMPAGNE,
      pacage: collection.value.features.at(0)?.properties?.PACAGE,
    }
  })
}

watch(files, async (newFiles) => {
  const [archive] = newFiles ?? []

  if (!archive) {
    collection.value = null
    return
  }

  try {
    const geojson = await convertShapefileArchiveToGeoJSON(archive)
    collection.value = geojson
  }
  catch (error) {
    console.error(error)
  }
})
</script>
