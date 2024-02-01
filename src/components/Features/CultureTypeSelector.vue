<template>
  <div v-if="requirePrecision && fromCodeCpf(modelValue)" class="fr-hint-text">
    Culture «&nbsp;{{ fromCodeCpf(modelValue).libelle_code_cpf }}&nbsp;» à préciser
  </div>

  <div ref="autocompleteRef"></div>

  <div v-if="requirePrecision" class="fr-hint-text fr-error-text">
    La culture a besoin d'être précisée.
  </div>
  <div v-else-if="!query" class="fr-hint-text">
    Saisissez le nom d'une culture pour la sélectionner parmi une liste.
  </div>
</template>

<script setup>
import { computed, Fragment, h, nextTick, onBeforeUnmount, onMounted, ref, render, shallowRef } from 'vue'

import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic'
import Fuse from 'fuse.js'
import cpf from '@agencebio/rosetta-cultures/data/cpf.json'
import { fromCodeCpf, fromCodePacAll, fromCodePacStrict } from "@agencebio/rosetta-cultures"

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    required: true
  },
  fromPac: {
    type: String,
    required: false
  }
})

const emit = defineEmits(['update:modelValue'])

const autocompleteProps = shallowRef(null)
const autocompleteRef = ref(null)
const showMore = ref(false)

const query = ref(fromCodeCpf(props.modelValue)?.libelle_code_cpf || '')

const choices = computed(() => {
  const selectableCpf = cpf
      .filter(({ is_selectable }) => is_selectable)
      .sort((a, b) => a.libelle_code_cpf.localeCompare(b.libelle_code_cpf))

  if (!requirePrecision.value || !props.fromPac || showMore.value) return selectableCpf

  const selectableFromPac = fromCodePacAll(props.fromPac)
      .filter(c => c.is_selectable)
      .sort((a, b) => a.libelle_code_cpf.localeCompare(b.libelle_code_cpf))

  return selectableFromPac.length ? selectableFromPac : selectableCpf
})

const requirePrecision = computed(() => props.modelValue && !(fromCodeCpf(props.modelValue)?.is_selectable))

onMounted(() => {
  autocompleteProps.value = autocomplete({
    container: autocompleteRef.value,
    placeholder: props.placeholder,
    openOnFocus: true,
    id: props.id,
    classNames: {
      form: 'fr-input',
      // inputWrapper: 'fr-input-wrap',
    },

    // helps react to query and isOpen changes
    onStateChange ({ state }) {
      query.value = state.query
    },

    getSources() {
      return [
        {
          sourceId: 'cultures',
          getItems ({ query }) {
            let items;

            if (query.length > 1) {
              items = new Fuse(choices.value, {
                keys: ['libelle_code_cpf'],
                minMatchCharLength: 2,
                threshold: 0.4,
              })
                  .search(query)
                  .map(({ item: { libelle_code_cpf: libelle, code_cpf: code } }) => ({ code, libelle }))
            } else if (requirePrecision.value || showMore.value) {
              items = choices.value.map(({ libelle_code_cpf: libelle, code_cpf: code }) => ({ code, libelle }))
            } else {
              items = []
            }

            if (requirePrecision.value && !(showMore.value)) {
              items.push({
                libelle: 'Voir toutes les cultures',
                code: 'showMore'
              })
            }

            return items
          },
          templates: {
            item ({ item, html }) {
              if (item.code === 'showMore') {
                return html`<span class="fr-link">Voir toutes les cultures</span>`
              }

              return item.libelle
            }

          },
          onSelect: function(event) {
            if (event.item.code === 'showMore') {
              showMore.value = true
              event.setQuery('')
              event.setIsOpen(true)
              return nextTick(() => {
                event.refresh()
              })
            }

            event.setQuery(event.item.libelle);
            emit('update:modelValue', event.item.code);
          }
        }
      ]
    },

    renderer: { createElement: h, Fragment, render }
  })

  autocompleteProps.value.setQuery?.(requirePrecision.value ? '' : query.value)
})

onBeforeUnmount(() => autocompleteProps.value.setIsOpen(false))
</script>

<style>
.aa-Panel {
  z-index: 2000;
}

.aa-Form {
  background-color: var(--background-contrast-grey);
  border: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding-right: 0;
}

.aa-Form:focus-within {
  box-shadow: none;
  outline-offset: 2px;
  outline-width: 2px;
  outline-color: #0a76f6;
}

.aa-PanelLayout {
  max-height: 20rem;
}

.aa-Autocomplete {
  margin-top: 0.5rem;
}

.aa-Item:hover {
  background-color: #ececfe;
}

.aa-InputWrapperPrefix {
  display: none;
}

.aa-InputWrapperSuffix {
  --border-width: 2px;
  --aa-search-input-height: calc((0.5rem * 2) + 1.5rem - var(--border-width));
  align-items: flex-start;
  margin-top: calc(var(--border-width) * -1); /* to counteract the align-items: center of the container */
}
.aa-ClearButton {
  border-radius: 0 .25rem 0 0;
}
</style>
