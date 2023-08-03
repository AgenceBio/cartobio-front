<template>
  <div class="fr-input-group">
    <label class="fr-label" :for="`${id}-input`" :id="`${id}-label`">Type de culture</label>

    <div v-if="requirePrecision && fromCodeCpf(modelValue)" class="fr-hint-text">
      Culture «&nbsp;{{ fromCodeCpf(modelValue).libelle_code_cpf }}&nbsp;» à préciser
    </div>

    <div class="fr-search-bar" v-bind="autocomplete.getRootProps({})" :class="{ 'has-results': results.length, 'is-open': isOpen, 'has-value': hasQuery }">
      <input className="fr-input" type="search" v-bind="autocomplete.getInputProps({})" />
      <button class="fr-btn fr-btn--tertiary-no-outline expand" title="Effacer" type="button" v-if="!hasQuery">
        Rechercher
    </button>
      <button class="fr-btn fr-btn--tertiary-no-outline clear" title="Effacer" type="button" @click="clear" v-else>
        Effacer
    </button>
    </div>

    <div className="aa-Panel" v-bind="autocomplete.getPanelProps({})">
      <ul className="aa-List" v-bind="autocomplete.getListProps()" v-if="isOpen">
        <li v-for="item in results.items" :key="item.code" className="aa-Item" v-bind="autocomplete.getItemProps({ item, source: results.source })">
          {{ item.libelle }}
        </li>
      </ul>
    </div>

    <div v-if="requirePrecision" class="fr-hint-text fr-error-text">
      La culture a besoin d'être précisée.
    </div>
    <div v-else-if="!query" class="fr-hint-text">
      Saisissez le nom d'une culture pour la sélectionner parmi une liste.
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from 'vue'

import { createAutocomplete } from '@algolia/autocomplete-core'
import '@algolia/autocomplete-theme-classic'
import Fuse from 'fuse.js'
import cpf from '@agencebio/rosetta-cultures/data/cpf.json'
import { fromCodeCpf, fromCodePacAll } from "@agencebio/rosetta-cultures"

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

const showMore = ref(false)

const query = ref(fromCodeCpf(props.modelValue)?.libelle_code_cpf || '')
const hasQuery = computed(() => Boolean(query.value.trim()))
const isOpen = ref(false)
const results = reactive({ items: [], source: null })

const choices = computed(() => {
  const selectableCpf = cpf.filter(({ is_selectable }) => is_selectable)

  if (!requirePrecision.value || !props.fromPac || showMore.value) {
    return selectableCpf
  }

  return fromCodePacAll(props.fromPac).filter(c => c.is_selectable)
})

const requirePrecision = computed(() => props.modelValue && !(fromCodeCpf(props.modelValue)?.is_selectable))

const autocomplete = shallowRef(createAutocomplete({
  placeholder: props.placeholder,
  autoFocus: false,
  openOnFocus: false,
  id: props.id,

  // helps react to query and isOpen changes
  onStateChange ({ state }) {
    query.value = state.query
    isOpen.value = state.isOpen

    console.log(state)

    if (state.collections.length) {
      results.source = Object.assign({}, state.collections.at(0).source)
      results.items = [...state.collections.flatMap(collection => collection.items)]
    }
  },

  initialState: {
    query: requirePrecision.value ? '' : query.value
  },

  getSources() {
    return [
      {
        sourceId: 'cultures',
        getItems ({ query }) {
          console.log('getItems', query)
          const fuse = new Fuse(choices.value, {
            keys: ['libelle_code_cpf'],
            minMatchCharLength: 2,
            threshold: 0.4,
          })

          const cultureChoices = fuse
            .search(query)
            .map(({ item: { libelle_code_cpf: libelle, code_cpf: code } }) => ({ code, libelle }))

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
          console.log('onSelect', event)
          if (event.item.code === 'showMore') {
            showMore.value = true
            event.setQuery('')
            event.setIsOpen(true)
            return nextTick(() => event.refresh())
          }

          event.setQuery(event.item.libelle);
          emit('update:modelValue', event.item.code);
        }
      }
    ]
  }
}))

onBeforeUnmount(() => autocomplete.value.setIsOpen(false))

function clear () {
  autocomplete.value.setQuery('')
  nextTick(() => autocomplete.value.refresh())
}
</script>

<style scoped>
.fr-input-group,
.fr-search-bar {
  position: relative;
}

.fr-search-bar .fr-btn {
  position: absolute;
  right: 0;
}
  .expand::before {
    mask-image: url("/node_modules/@gouvfr/dsfr/dist/icons/system/arrow-down-s-line.svg") !important;
  }
  .clear::before {
    mask-image: url("/node_modules/@gouvfr/dsfr/dist/icons/system/close-line.svg") !important;
  }

.aa-Panel {
  z-index: 2000;
  width: 100%;
}

.aa-PanelLayout {
  max-height: calc(100vh - 25rem);
}

.aa-Autocomplete {
  margin-top: 0.5rem;
}

.aa-Item {
  padding-left: 1rem;
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
