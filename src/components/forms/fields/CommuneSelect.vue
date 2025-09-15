<template>
  <div :style="style" :class="$props.class">
    <div ref="autocompleteRef"></div>
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
              // autocomplete lib does not handle errors properly so we have to do it ourselves
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

<style>
.aa-Panel {
  z-index: 2000;
}

.aa-Form {
  background-color: var(--background-contrast-grey);
  border: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding-right: 10px;
}

.aa-InputWrapperSuffix::before {
  content: "";
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background: no-repeat center/contain
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"/></svg>');
  margin: auto;
}

.aa-Input {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.aa-Form:focus-within {
  box-shadow: none;
  outline-offset: 2px;
  outline-width: 2px;
  outline-color: #0a76f6;
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
  margin-top: calc(var(--border-width) * -1); /* to counteract the align-items: center of the container */
}
.aa-ClearButton {
  border-radius: 0 0.25rem 0 0;
}
</style>
