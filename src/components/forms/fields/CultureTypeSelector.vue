<template>
  <div
    class="fr-input-group culture-selector"
    :class="{ 'fr-input-group--error': hasErrors, 'fr-input-group': !needTitle }"
  >
    <label v-if="needTitle" class="fr-label" :for="`cpf-${culture.id}-input`">Culture</label>

    <div v-if="requirePrecision && fromCodeCpf(modelValue)" class="fr-hint-text">
      Culture «&nbsp;{{ fromCodeCpf(modelValue).libelle_code_cpf }}&nbsp;» à préciser
    </div>

    <input
      v-if="disabledInput && (fromCodeCpf(culture.CPF) || disabledAutoComplete)"
      type="text"
      :disabled="disabledInput"
      class="fr-input"
      :value="fromCodeCpf(culture.CPF)?.libelle_code_cpf"
    />
    <div v-else ref="autocompleteRef"></div>

    <div v-for="[id, result] in errors" :key="id" class="fr-hint-text fr-error-text">{{ result.errorMessage }}.</div>

    <div v-if="!hasErrors && !query && needTitle" class="fr-hint-text">
      Saisissez le nom d'une culture pour la sélectionner parmi une liste.
    </div>
  </div>
</template>

<script setup>
import { computed, Fragment, h, nextTick, onBeforeUnmount, onMounted, ref, render, shallowRef, watch } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";

import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import Fuse from "fuse.js";
import cpf from "@agencebio/rosetta-cultures/data/cpf.json";
import { fromCodeCpf, fromCodePacAll } from "@agencebio/rosetta-cultures";
import { useFeaturesStore } from "@/stores/features";

const props = defineProps({
  culture: {
    type: Object,
    required: true,
  },
  featureId: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    required: true,
  },
  disabledInput: {
    type: Boolean,
    default: false,
  },
  needTitle: {
    type: Boolean,
    default: true,
  },
  disabledAutoComplete: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const autocompleteProps = shallowRef(null);
const autocompleteRef = ref(null);
const showMore = ref(false);

const featuresSets = useFeaturesSetsStore();
const errors = computed(() => featuresSets.byFeatureDetail(props.featureId, props.culture.id, true));
const hasErrors = computed(() => errors.value.size > 0);

const features = useFeaturesStore();
const feature = computed(() => features.getFeatureById(props.featureId));

const query = ref(fromCodeCpf(props.modelValue)?.libelle_code_cpf || "");

const choices = computed(() => {
  const selectableCpf = cpf.CPF.filter(({ is_selectable }) => is_selectable).sort((a, b) =>
    a.libelle_code_cpf.localeCompare(b.libelle_code_cpf),
  );

  if (!requirePrecision.value || !feature.value.properties.CODE_CULTURE || showMore.value) return selectableCpf;

  const selectableFromPac = fromCodePacAll(
    feature.value.properties.CODE_CULTURE,
    feature.value.properties.CODE_PRECISION || undefined,
  )
    .filter((c) => c.is_selectable)
    .sort((a, b) => a.libelle_code_cpf.localeCompare(b.libelle_code_cpf));

  return selectableFromPac.length ? selectableFromPac : selectableCpf;
});

const requirePrecision = computed(() => {
  if (!props.modelValue) return true;

  return !fromCodeCpf(props.modelValue)?.is_selectable;
});

const createAutocomplete = () => {
  if (!autocompleteRef.value || autocompleteProps.value) return;

  autocompleteProps.value = autocomplete({
    container: autocompleteRef.value,
    placeholder: props.placeholder,
    openOnFocus: true,
    id: `cpf-${props.culture.id}`,
    classNames: {
      form: "fr-input",
    },

    onStateChange({ state }) {
      query.value = state.query;
      if (query.value == "") {
        emit("update:modelValue", "");
      }
    },

    getSources() {
      return [
        {
          sourceId: "cultures",
          getItems({ query }) {
            let items;

            if (query.length > 1) {
              items = new Fuse(choices.value, {
                keys: ["libelle_code_cpf"],
                minMatchCharLength: 2,
                threshold: 0.4,
              })
                .search(query)
                .map(({ item: { libelle_code_cpf: libelle, code_cpf: code } }) => ({ code, libelle }));
            } else {
              items = choices.value.map(({ libelle_code_cpf: libelle, code_cpf: code }) => ({ code, libelle }));
            }

            if (requirePrecision.value && !showMore.value) {
              items.push({
                libelle: "Voir toutes les cultures",
                code: "showMore",
              });
            }

            return items;
          },
          templates: {
            item({ item, html }) {
              if (item.code === "showMore") {
                return html`<span class="fr-link">Voir toutes les cultures</span>`;
              }

              return item.libelle;
            },
          },
          onSelect: function (event) {
            if (event.item.code === "showMore") {
              showMore.value = true;
              event.setQuery("");
              event.setIsOpen(true);
              return nextTick(() => {
                event.refresh();
              });
            }
            event.setQuery(event.item.libelle);
            emit("update:modelValue", event.item.code);
          },
        },
      ];
    },

    renderer: { createElement: h, Fragment, render },
  });

  autocompleteProps.value.setQuery?.(requirePrecision.value ? "" : query.value);
};

const destroyAutocomplete = () => {
  if (autocompleteProps.value) {
    autocompleteProps.value.destroy?.();
    autocompleteProps.value = null;
  }
};

watch(
  () => props.disabledInput,
  async (newValue) => {
    await nextTick();

    if (newValue) {
      destroyAutocomplete();
    } else {
      createAutocomplete();
    }
  },
);

onMounted(() => {
  if (!props.disabledInput) {
    createAutocomplete();
  }
});

onBeforeUnmount(() => {
  destroyAutocomplete();
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

.culture-selector .aa-Autocomplete {
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
}

.aa-ClearButton {
  border-radius: 0 0.25rem 0 0;
}
</style>
