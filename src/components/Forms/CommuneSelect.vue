<template>
  <div ref="autocompleteRef"></div>
  <div class="fr-hint-text">Saisissez le nom d'une commune</div>
</template>

<script setup>
import { Fragment, h, onMounted, ref, render } from 'vue'
import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic';
import axios from "axios";

const autocompleteRef = ref(null)

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const setQueryRef = ref(null)

const updateFieldFromModel = async (value) => {
  if (!value) {
    return
  }

  try {
    const response = await axios.get(`https://geo.api.gouv.fr/communes/${value}`)
    setQueryRef.value(`${response.data.nom} (${response.data.codeDepartement})`)
  } catch (e) {
    if (e.response.status === 404) {
      setQueryRef.value('')
    }

    throw e;
  }
}

onMounted(async () => {
  const { setQuery } = autocomplete({
    container: autocompleteRef.value,
    placeholder: 'Saisissez le nom d’une commune',
    openOnFocus: true,
    getSources() {
      return [
        {
          sourceId: 'ban',
          async getItems ({ query }) {
            if (query.length < 3) {
              return []
            }

            const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
              params: {
                q: query,
                type: 'municipality',
                autocomplete: 1
              }
            })

            return response.data.features
                .map(({ properties: { label, citycode, context, score } }) => ({score, citycode, name: `${label} (${context})`}))
                .sort((a, b) => a.score < b.score)
          },
          templates: {
            item ({ item, html }) {
              return html`<li>${ item.name }</li>`
            }
          },
          onSelect: function(event) {
            event.setQuery(event.item.name);
            emit('update:modelValue', event.item.citycode);
          },
        }
      ]
    },
    renderer: { createElement: h, Fragment, render }
  })
  setQueryRef.value = setQuery

  await updateFieldFromModel(props.modelValue)
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
