<template>
  <div ref="autocompleteRef"></div>
  <div class="fr-hint-text">Saisissez le nom d'une culture</div>
</template>

<script setup>
import { Fragment, h, onMounted, ref, render } from 'vue'
import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic';
import cpf from '@agencebio/rosetta-cultures/data/cpf.json'
import { fromCodeCpf } from "@agencebio/rosetta-cultures"

const autocompleteRef = ref(null)

const props = defineProps(['modelValue'])
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
            return cpf
                .filter(({ is_selectable }) => is_selectable)
                .filter(({ libelle_code_cpf: libelle }) => libelle.toLowerCase().includes((query || '').toLowerCase()))
                .map(({ libelle_code_cpf: libelle, code_cpf: code }) => ({ code, libelle }))
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

  setQuery?.(fromCodeCpf(props.modelValue)?.libelle_code_cpf || '')
})
</script>

<style>
.aa-Panel {
  z-index: 2000;
}

.aa-Item:hover {
  background-color: #ececfe;
}

.aa-InputWrapperPrefix {
  display: none;
}

.aa-InputWrapper {
  padding-left: 0.75rem
}
</style>
