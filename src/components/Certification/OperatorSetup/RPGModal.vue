<template>
  <component :is="Modal" v-bind="$attrs">
    <template #title>Import des données PAC de {{ télépac.preloadedCampagne }}</template>

    <form id="rpg-lookup-form" @submit.prevent="handleLookup">
      <div :class="{'fr-input-group': true, 'fr-input-group--valid': isPacageValid}">
        <label class="fr-label" for="pacage">
          Numéro PACAGE
        </label>
        <input type="text" pattern="\d{8,9}" maxlength="9" class="fr-input fr-input--pacage" id="pacage" name="pacage" v-model="numeroPacage" />
      </div>
    </form>

    <section class="fr-my-3w" v-if="(collection && collection.features.length)">
      <p>
        Nous avons trouvé {{ collection.features.length }} parcelles,
        pour une surface graphique totale de {{ inHa(surface(collection)) }}&nbsp;ha.
      </p>

      <MapPreview :collection="collection" />
    </section>
    <div class="fr-alert fr-alert--info fr-my-3w" v-else-if="(collection && !collection.features.length)">
      <h3 class="fr-alert__title">Aucune parcelle trouvée</h3>
      <p>
        Nous n'avons pas connaissance de parcelles déclarées
        à la PAC en {{ télépac.preloadedCampagne }} pour le PACAGE {{ numeroPacage }}.
      </p>
    </div>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
        <li v-if="!collection">
          <button :disabled="(isLoading || !isPacageValid)" class="fr-btn fr-btn--secondary" form="rpg-lookup-form">
            Vérifier la disponibilité des parcelles
          </button>
        </li>
        <li v-else-if="(collection && collection.features.length)">
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
import { computed, ref } from 'vue'

import Modal from '@/components/Modal.vue'
import MapPreview from '@/components/Map/Preview.vue'

import { useTélépac, isValid, normalize } from '@/referentiels/pac.js'
import { surface, inHa } from '@/components/Features/index.js'
import { pacageLookup } from '@/cartobio-api.js'
import { sources } from '@/referentiels/imports.js'

const props = defineProps({
  operator: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['upload'])

const télépac = useTélépac()
const numeroPacage = ref(props.operator.numeroPacage ?? '')
const isLoading = ref(false)
const collection = ref(null)

const normalizedPacage = computed(() => normalize(numeroPacage.value))
const isPacageValid = computed(() => isValid(normalizedPacage.value))

async function handleLookup () {
  isLoading.value = true
  collection.value = await pacageLookup(normalizedPacage.value)
  isLoading.value = false
}

function reset () {
  collection.value = null
  numeroPacage.value = props.operator.numeroPacage ?? ''
}

function confirmImport () {
  emit('upload', { geojson: collection.value, source: sources.RPG })
}
</script>

<style scoped>
.fr-input--pacage {
  font-family: monospace;
  font-weight: bold;
  letter-spacing: 1rem;
  max-width: calc(9 * 2rem);
}
</style>
