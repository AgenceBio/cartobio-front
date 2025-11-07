<template>
  <div :style="style" :class="$props.class" class="fr-search-bar fr-mb-1v">
    <div class="wrapper">
      <label class="fr-label" for="search">Saisissez le nom d'une commune</label>
      <div class="input" ref="autocompleteRef"></div>
      <button class="fr-btn button-search" type="submit" title="Rechercher"></button>
    </div>
  </div>
</template>

<script setup>
import { Fragment, h, onMounted, ref, render } from "vue";
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import axios, { AxiosError } from "axios";
import toast from "@/utils/toast.js";

const autocompleteRef = ref(null);

const props = defineProps(["modelValue", "style", "class"]);
const emit = defineEmits(["update:modelValue", "feature"]);
const setQueryRef = ref(null);

const updateFieldFromModel = async (value) => {
  if (!value) {
    return;
  }

  try {
    const response = await axios.get(`https://geo.api.gouv.fr/communes/${value}`);
    setQueryRef.value(`${response.data.nom} (${response.data.codeDepartement})`);
  } catch (e) {
    if (e.response.status === 404) {
      setQueryRef.value("");
    }

    throw e;
  }
};

onMounted(async () => {
  const { setQuery } = autocomplete({
    container: autocompleteRef.value,
    placeholder: "Saisissez le nom d’une commune",
    id: "search",
    openOnFocus: true,
    classNames: {
      form: "fr-input",
    },
    onReset() {
      emit("update:modelValue", "");
    },
    getSources() {
      return [
        {
          sourceId: "ban",
          async getItems({ query }) {
            if (query.length < 3) {
              return [];
            }

            let response;
            try {
              response = await axios.get("https://api-adresse.data.gouv.fr/search/", {
                params: {
                  q: query,
                  type: "municipality",
                  autocomplete: 1,
                },
              });
            } catch (error) {
              if (
                error.name === "AxiosError" &&
                [AxiosError.ETIMEDOUT, AxiosError.ECONNABORTED, AxiosError.ERR_NETWORK].includes(error.code)
              ) {
                toast.error("Une erreur de réseau est survenue. Vérifiez votre connexion internet.");
                return [];
              } else {
                throw error;
              }
            }

            return response.data.features.sort((a, b) => a.properties.score < b.properties.score);
          },
          templates: {
            item({ item, html }) {
              return html`<li>${item.properties.label} (${item.properties.context})</li>`;
            },
          },
          onSelect: function (event) {
            event.setQuery(event.item.properties.label);
            emit("update:modelValue", event.item.properties.citycode);
            emit("feature", event.item);
          },
        },
      ];
    },
    renderer: { createElement: h, Fragment, render },
  });
  setQueryRef.value = setQuery;

  await updateFieldFromModel(props.modelValue);
});
</script>

<style scoped>
.aa-Panel {
  z-index: 2000;
}

.aa-Form {
  background-color: var(--background-contrast-grey);
  border: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding-right: 0px;
}

.aa-Input {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.aa-Form:focus-within {
  box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
  outline-offset: 2px;
  outline-width: 2px;
  outline-color: #0a76f6;
  outline-style: solid;
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

.aa-Item[aria-selected="true"] {
  outline: 2px solid var(--border-active-blue-france);
}

.aa-InputWrapperPrefix {
  display: none;
}

.aa-InputWrapperSuffix {
  --border-width: 2px;
  --aa-search-input-height: calc((0.5rem * 2) + 1.5rem - var(--border-width));
  align-items: flex-start;
  margin-top: calc(var(--border-width) * -1);
  /* to counteract the align-items: center of the container */
}

.aa-Input::placeholder {
  color: #666666;
}

.aa-ClearButton {
  border-radius: 0 0.25rem 0 0;
}

.input {
}

.icon-btn {
  padding: 0rem 0rem 0rem 0rem;
}

.button-search {
  height: fit-content;
  margin-bottom: 0px;
  margin-top: auto;
}

.wrapper {
  display: flex;
}

.aa-Item {
  padding: 0.5rem 1.8em 0.5rem 1.8em;
}

:deep(.aa-SubmitButton) {
  display: none !important;
}
</style>
