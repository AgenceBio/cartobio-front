<template>
  <div ref="autocompleteRef"></div>
  <div class="fr-hint-text">Saisissez le nom d'une culture</div>
</template>

<script setup>
import { liste as codesPac } from '@/referentiels/pac.js'
import { Fragment, h, onMounted, ref, render } from 'vue'
import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic';

const autocompleteRef = ref(null)

const { modelValue } = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  const { setQuery } = autocomplete({
    container: autocompleteRef.value,
    placeholder: 'Saisissez le nom d’une culture',
    openOnFocus: true,
    getSources() {
      return [
        {
          sourceId: 'cultures',
          getItems ({ query }) {
            return codesPac
                .filter(([, libelle]) => libelle.toLowerCase().includes(query || ''.toLowerCase()))
                .map(([code, libelle]) => ({code: code, libelle: libelle}))
                .sort((a, b) => a.libelle.localeCompare(b.libelle))
          },
          templates: {
            item ({ item, html }) {
              return html`<li>${ item.libelle }</li>`
            }
          },
          onSelect: function(event) {
            event.setQuery(event.item.libelle);
            emit('update:modelValue', event.item.code);
          },
        }
      ]
    },
    renderer: { createElement: h, Fragment, render }
  })

  setQuery(codesPac.find(([code,]) => code === modelValue)?.[1] || '')
})
</script>

<style>
.aa-Panel {
  z-index: 2000;
}

.aa-Item:hover {
  background-color: #ececfe;
}
</style>
