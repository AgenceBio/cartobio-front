<template>
  <div class="fr-input-group" ref="autocompleteRef">
    <label class="fr-label">Type de culture</label>
    <input type="text" class="fr-input" v-model="searchInput" required v-bind="$attrs" />
  </div>
</template>

<script setup>
import { Fragment, h, onMounted, ref, render } from 'vue'
import axios from 'axios'
import { autocomplete } from '@algolia/autocomplete-js'

const autocompleteRef = ref(null)
const searchInput = ref('')
const emit = defineEmits(['submit'])
const props = defineProps({
  search: {
    type: Function,
    required: true
  }
})

onMounted(() => {
  autocomplete({
    container: autocompleteRef.value,
    openOnFocus: true,
    getSources({ query }) {
      return [
        {
          sourceId: 'adresse.data.gouv.fr',
          getItems () {
            console.log({ query })
            return [
              { code: '26108', label: 'Crest' },
              { code: '33000', label: 'Bordeaux' }
            ]
          },
          templates: {
            item ({ item, html, components }) {
              return html`<li>${ item.label }</li>`
            }
          }
        }
      ]
    },
    renderer: { createElement: h, Fragment, render }
  })
})

</script>

<style scoped>

</style>
