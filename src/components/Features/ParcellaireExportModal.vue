<template>
  <component :is="Modal" v-bind="$attrs">
    <template #title>Export de parcellaire</template>

    <p>
      Réutilisez vos données dans
      d'autres applications sans avoir à les recopier.
    </p>

    <p>
      Choisissez un format qui vous semble adapté à votre usage.
    </p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg fr-btns-group--icon-left">
        <li>
          <button class="fr-btn fr-icon-table-line fr-btn--secondary">
            Excel
          </button>
        </li>
        <li>
          <button class="fr-btn fr-icon-france-line fr-btn--secondary" @click="geojsonExport">
            Géographique&nbsp;<small>(GeoJSON)</small>
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { readonly, toRaw } from 'vue'
import store from '@/store.js'
import Modal from '@/components/Modal.vue'

const currentUser = readonly(store.state.currentUser)
const parcellaire = toRaw(store.state.parcellaire)

function geojsonExport() {
  const blob = new Blob(
    [JSON.stringify(parcellaire, null, 2)],
    { type: 'application/json'}
  )

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `parcellaire-operateur-${currentUser.id}.json`
  link.click()
}
</script>
