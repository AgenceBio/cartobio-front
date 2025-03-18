<template>
  <form
    @submit.prevent="search(userInput)"
    class="fr-search-bar fr-search-bar--lg fr-mb-3w"
    id="header-search"
    role="search"
  >
    <label class="fr-label" for="search"
      >{{ placeholder ? placeholder : " Recherche par nom d'exploitation, SIRET ou numéro bio" }}
    </label>
    <div class="input" ref="autocompleteRef"></div>

    <button
      class="fr-btn"
      :class="{ 'icon-btn': buttonLabel === '' }"
      type="submit"
      title="Rechercher"
      :disabled="!isOnline"
    >
      {{ buttonLabel }}
    </button>
  </form>
</template>

<script setup>
import { Fragment, h, onBeforeUnmount, onMounted, ref, render } from "vue";
import { useOnline } from "@vueuse/core";
import { useRouter } from "vue-router";
import { getForAutocomplete } from "@/cartobio-api";

import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import Fuse from "fuse.js";

const isOnline = useOnline();
const userInput = ref();
const router = useRouter();
const query = ref();
const autocompleteRef = ref(null);
const data = ref(null);
const length = ref(0);
const autocompleteElement = ref(null);

const emit = defineEmits(["search"]);
const props = defineProps({
  buttonLabel: {
    type: String,
    required: false,
    default: "Rechercher",
  },
  initialValue: {
    type: String,
    required: false,
    default: "",
  },
  placeholder: {
    type: String,
    required: false,
  },
  route: {
    type: String,
    required: false,
    default: "/certification/exploitations",
  },
});

onMounted(() => {
  autocompleteElement.value = autocomplete({
    container: autocompleteRef.value,
    translations: {
      detachedCancelButtonText: "Annuler",
    },
    placeholder: props.placeholder ? props.placeholder : "Rechercher par nom, SIRET, n° Bio ou n° client",
    openOnFocus: true,
    id: "search",
    classNames: {
      form: "fr-input",
    },

    // helps react to query and isOpen changes
    onStateChange({ state }) {
      query.value = state.query;
    },

    getSources({ query }) {
      userInput.value = query;
      if (query.length < 3) {
        data.value = null;
        return [];
      }
      if (query.length === 3 || data.value === null) {
        if (data.value) {
          return getResult(query);
        }
        data.value = [];
        return getForAutocomplete(query.slice(0, 3)).then((res) => {
          data.value = res;
          return getResult(query);
        });
      }

      return getResult(query);
    },
    templates: {
      empty({ html }) {
        return html`Aucune suggestion voir tout les résultats`;
      },
    },
    onReset() {
      userInput.value = "";
      search();
    },
    renderer: { createElement: h, Fragment, render },
  });

  if (props.initialValue) {
    userInput.value = props.initialValue;
    autocompleteElement.value.setQuery(props.initialValue);
  }
});
onBeforeUnmount(() => {
  autocompleteElement.value.setIsOpen(false);
});
async function search(search) {
  if (search) {
    emit("search", search);
    return router.push({ path: props.route, query: { search } });
  }

  emit("search");
  return router.push({ path: props.route });
}

function getResult(query) {
  userInput.value = query;

  return [
    {
      sourceId: "operateurs-api",
      getItems() {
        const res = new Fuse(data.value, {
          keys: ["nom", "denominationCourante", "numeroBio", "siret", "numeroClient"],
          minMatchCharLength: 2,
          threshold: 0,
          ignoreDiacritics: true,
          ignoreLocation: true,
        })
          .search(query)
          .map(({ item }) => ({ ...item }));

        length.value = res.length;

        return res.slice(0, 5);
      },
      templates: {
        item({ item, html }) {
          return html`
            <div>
              <a class="fr-link" href="/exploitations/${item.numeroBio}">${hightlightText(query, item.nom, html)}</a>
              <div class="flex gap-6">
                <div class="fr-hint-text">Dénomination courante</div>
                <div class="fr-text--xs fr-mb-0">${hightlightText(query, item.denominationCourante, html)}</div>
              </div>
              <div class="flex gap-24">
                <div class="flex gap-6">
                  <div class="fr-hint-text">N° Bio</div>
                  <div class="fr-text--xs fr-mb-0">${hightlightText(query, item.numeroBio, html)}</div>
                </div>
                <div class="flex gap-6">
                  <div class="fr-hint-text">N° Client</div>
                  <div class="fr-text--xs fr-mb-0">${hightlightText(query, item.numeroClient, html)}</div>
                </div>
                <div class="flex gap-6">
                  <div class="fr-hint-text">Siret</div>
                  <div class="fr-text--xs fr-mb-0">${hightlightText(query, item.siret, html)}</div>
                </div>
              </div>
            </div>
          `;
        },
        footer({ html }) {
          return html`
            <a class="fr-btn fr-btn--secondary see-more-link" href="${props.route}?search=${query}"
              >Voir tous les résultats</a
            >
          `;
        },
        header({ html }) {
          return html` <div class="fr-hint-text">
            ${length.value === 0 ? "Aucune" : length.value} suggestion${length.value > 1 ? "s" : ""}
          </div>`;
        },
        noResults({ html }) {
          return html``;
        },
      },
      onSelect: function ({ item }) {
        return router.push({
          path: `/exploitations/${item.numeroBio}`,
        });
      },
      // ...
    },
  ];
}

function hightlightText(query, text, html) {
  if (!text) {
    return "";
  }
  text = `${text}`;
  const normalizedQuery = query
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normalizedText = text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  let index;

  if ((index = normalizedText.indexOf(normalizedQuery)) === -1) {
    return text;
  }

  return html`${text.slice(0, index)}<span class="highlight">${text.slice(index, index + query.length)}</span
    >${text.slice(index + query.length)}`;
}
</script>

<style scoped>
.header-exploitations {
  background: #e3fdeb;
}
.background-white {
  background-color: white;
}

.header-exploitations::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 50px;
  background: #e3fdeb;
  z-index: -1;
}
span[aria-selected="true"] {
  font-weight: bold;
}

.content {
  border-top: solid 1px #cfcfcf;
}

.title-search {
  display: flex;
  justify-content: space-between;
}
.green-link {
  color: #18753c;
}
.input {
  width: 100%;
}
.icon-btn {
  padding: 0rem 0rem 0rem 0.6rem;
}
</style>

<style>
.aa-Panel {
  z-index: 2000;
  margin-top: 0;
}

/* todo Ajouter bordure au focus */

.aa-Form {
  background-color: var(--background-alt-grey);
  border: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding-right: 0;
}

.aa-Form:focus-within {
  box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
  outline-offset: 2px;
  outline-width: 2px;
  outline-color: #0a76f6;
  outline-style: solid;
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
  margin-top: calc(var(--border-width) * -1);
  /* to counteract the align-items: center of the container */
}

.aa-Input::placeholder {
  color: #666666;
}

.aa-ClearButton {
  border-radius: 0 0.25rem 0 0;
}
.flex {
  display: flex;
}

.gap-6 {
  gap: 6px;
}

.gap-24 {
  gap: 24px;
}

.see-more-link {
  flex: 1;
  justify-content: center;
}

.aa-SourceFooter {
  display: flex;
  padding-top: 2rem;
  border-top: #dddddd 1px solid;
  margin: 1.25rem 1.8rem;
}

.aa-SourceHeader {
  padding: 1.8rem 1.8rem 0.5rem 1.8rem;
  margin: 0;
}

.aa-Item {
  padding: 0.5rem 1.8em 0.5rem 1.8em;
}

.highlight {
  background-color: #feebd0;
}

.aa-SourceNoResults {
  padding: 0;
}

[href] > .highlight {
  background-image: var(--underline-img), var(--underline-img);
  background-position:
    var(--underline-x) 100%,
    var(--underline-x) calc(100% - var(--underline-thickness));
  background-repeat: no-repeat, no-repeat;
  -webkit-transition: background-size 0s;
  transition: background-size 0s;
  background-size:
    var(--underline-hover-width) calc(var(--underline-thickness) * 2),
    var(--underline-idle-width) var(--underline-thickness);
  background-color: #feebd0;
}
</style>
