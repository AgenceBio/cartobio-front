<template>
  <div v-if="requirePrecision && fromCodeCpf(modelValue)" class="fr-hint-text">
    Culture «&nbsp;{{ fromCodeCpf(modelValue).libelle_code_cpf }}&nbsp;» à préciser
  </div>

  <div ref="autocompleteRef"></div>

  <div v-if="requirePrecision" class="fr-hint-text fr-error-text">
    La culture a besoin d'être précisée
  </div>
  <div v-else class="fr-hint-text">Saisissez le nom d'une culture</div>
</template>

<script setup>
import { computed, Fragment, h, nextTick, onBeforeUnmount, onMounted, ref, render, shallowRef } from 'vue'

import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic';
import cpf from '@agencebio/rosetta-cultures/data/cpf.json'
import { fromCodeCpf, fromCodePacAll } from "@agencebio/rosetta-cultures"

const props = defineProps({
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

const choices = computed(() => {
  const selectableCpf = cpf.filter(({ is_selectable }) => is_selectable)

  if (!requirePrecision.value || !props.fromPac || showMore.value) return selectableCpf

  return fromCodePacAll(props.fromPac)
      .filter(c => c.is_selectable)
})

const requirePrecision = computed(() => props.modelValue && !(fromCodeCpf(props.modelValue)?.is_selectable))

onMounted(() => {
  autocompleteProps.value = autocomplete({
    container: autocompleteRef.value,
    placeholder: props.placeholder,
    openOnFocus: true,
    getSources() {
      return [
        {
          sourceId: 'cultures',
          getItems ({ query }) {
            const cultureChoices = choices.value
                .filter(({ libelle_code_cpf: libelle }) => libelle.toLowerCase().includes((query || '').toLowerCase()))
                .map(({ libelle_code_cpf: libelle, code_cpf: code }) => ({ code, libelle }))
                .sort((a, b) => a.libelle.localeCompare(b.libelle))

            if (requirePrecision.value && !(showMore.value)) {
              cultureChoices.push({
                libelle: 'Voir toutes les cultures',
                code: 'showMore'
              })
            }

            return cultureChoices
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
          },
        }
      ]
    },

    renderer: { createElement: h, Fragment, render }
  })

  autocompleteProps.value.setQuery?.(requirePrecision.value ? '' : fromCodeCpf(props.modelValue)?.libelle_code_cpf || '')
})

onBeforeUnmount(() => autocompleteProps.value.setIsOpen(false))
</script>

<style>
.aa-Panel {
  z-index: 2000;
}

.aa-PanelLayout {
  max-height: calc(100vh - 25rem);
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

.aa-InputWrapper {
  padding-left: 0.75rem;
}
</style>