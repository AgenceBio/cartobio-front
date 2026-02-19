<template>
  <Modal @close="$emit('close')">
    <template #title> Rechercher une parcelle cadastrale </template>
    <fieldset
      class="fr-fieldset"
      :class="{ 'fr-fieldset--error': isError, 'fr-fieldset--valid': !!feature && !isError }"
    >
      <div class="fr-fieldset__row full-row">
        <div class="fr-input-group">
          <label class="fr-label">Commune</label>
          <CommuneSelect class="commune-select" v-model="communeRef" />
        </div>
      </div>

      <div class="fr-fieldset__row">
        <div class="fr-input-group">
          <label :for="`parcel-prefix-${fieldId}`" class="fr-label">
            Préfixe (facultatif)
            <span class="fr-hint-text">Exemple : 000, 011</span>
          </label>
          <input
            type="text"
            class="fr-input"
            :id="`parcel-prefix-${fieldId}`"
            placeholder="000"
            :disabled="commune === ''"
            v-model="prefix"
            @keydown.enter="searchReference"
          />
        </div>

        <div class="fr-input-group">
          <label :for="`parcel-section-${fieldId}`" class="fr-label">
            Section
            <span class="fr-hint-text">Exemple : A, AD</span>
          </label>
          <input
            type="text"
            class="fr-input"
            :id="`parcel-section-${fieldId}`"
            :disabled="commune === ''"
            v-model="section"
            required
            @keydown.enter="searchReference"
          />
        </div>

        <div class="fr-input-group">
          <label :for="`parcel-number-${fieldId}`" class="fr-label">
            N° de parcelle
            <span class="fr-hint-text">Exemple : 250, 1</span>
          </label>
          <input
            type="text"
            class="fr-input"
            :id="`parcel-number-${fieldId}`"
            :disabled="commune === ''"
            v-model="number"
            required
            @keydown.enter="searchReference"
          />
        </div>
      </div>

      <div class="fr-fieldset__row actions-row">
        <button
          v-if="feature && canDelete"
          class="fr-btn fr-btn--secondary fr-icon-delete-line"
          @click="emit('delete')"
        >
          Supprimer
        </button>
        <button v-else-if="isFetchingGeometry" class="fr-btn fr-btn--secondary fr-icon-time-fill" disabled>
          Recherche...
        </button>
        <button v-else class="fr-btn fr-btn--icon-right fr-icon-search-line" @click="searchReference">
          Rechercher
        </button>
      </div>
    </fieldset>

    <span v-if="searchError" class="fr-hint-text fr-message--error">{{ searchError }}</span>
    <span v-if="formError" class="fr-hint-text fr-message--error">{{ formError }}</span>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="$emit('close')" ref="autofocusedElement">Annuler</button>
        </li>
        <li>
          <button class="fr-btn fr-btn--secondary" @click="addParcelleCadastrale()">Sélectionner la parcelle</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped>
.fr-fieldset__row {
  display: inline-flex;
  gap: 1rem;
  margin-bottom: 20px;
}

.full-row {
  justify-content: flex-start;
  width: 100%;
}

.full-row .fr-input-group {
  flex: 1 1 100%;
}

.fr-fieldset__row > .fr-input-group {
  flex: 1 1 0;
  min-width: 0;
}

.fr-input-group {
  width: 100%;
  padding-bottom: 10px;
}

.fr-fieldset__row {
  align-items: flex-start;
}

.fr-fieldset__row .fr-input-group .fr-label {
  min-height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.actions-row {
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
  display: flex;
}
</style>

<script setup>
import axios from "axios";

import { computed, ref, watch } from "vue";
import { cleanInput, isValidReference, toString } from "../../../utils/cadastre.js";
import toast from "@/utils/toast.js";
import Modal from "@/components/widgets/Modal.vue";
import CommuneSelect from "@/components/forms/fields/CommuneSelect.vue";

const props = defineProps({
  commune: {
    type: String,
    required: true,
  },
  formError: {
    type: String,
    default: "",
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  fieldId: {
    type: String,
    default: function () {
      return crypto.randomUUID();
    },
  },
});

const emit = defineEmits(["feature", "delete"]);

const communeRef = ref(props.commune || null);

// Internal text field values
const prefix = ref("");
const section = ref("");
const number = ref("");

// State and validation
const isFetchingGeometry = ref(false);
const searchError = ref("");
const isError = computed(() => !!searchError.value || props.formError);

// Exposed values
const inputReference = computed(() =>
  toString({
    commune: communeRef.value,
    prefix: cleanInput(prefix.value),
    section: cleanInput(section.value),
    number: cleanInput(number.value),
  }),
);
const feature = ref(null);

// Search logic
const cadastreRequestController = ref(null);
const searchReference = async (event) => {
  if (event && event.preventDefault) {
    event.preventDefault();
  }

  if (cleanInput(section.value) === "" || cleanInput(number.value) === "" || !isValidReference(inputReference.value)) {
    searchError.value = "La référence cadastrale n'est pas valide.";
    return;
  }

  isFetchingGeometry.value = true;

  if (cadastreRequestController.value) {
    cadastreRequestController.value.abort();
  }
  cadastreRequestController.value = new AbortController();

  let featureCollection;
  try {
    // @see https://geoservices.ign.fr/documentation/services/services-geoplateforme/geocodage
    ({ data: featureCollection } = await axios.get("https://data.geopf.fr/geocodage/search", {
      params: { q: inputReference.value, index: "parcel", limit: 1, returntruegeometry: true },
      signal: cadastreRequestController.value.signal,
    }));
  } catch (error) {
    if (error.name === "CanceledError") {
      return;
    }

    toast.error("Une erreur est survenue lors de la recherche de la parcelle.");
    console.error("Failed to fetch geometry for ref", inputReference.value, error);
  } finally {
    isFetchingGeometry.value = false;
  }
  if (featureCollection.features.length) {
    searchError.value = "";
    feature.value = {
      type: "Feature",
      geometry: featureCollection.features.at(0).properties.truegeometry,
      properties: {
        prefixe: featureCollection.features.at(0).properties.districtcode,
        section: cleanPrefix(featureCollection.features.at(0).properties.section),
        numero: cleanPrefix(featureCollection.features.at(0).properties.number),
      },
    };
  } else {
    feature.value = null;
    searchError.value = "La référence cadastrale n'est pas reconnue dans cette commune.";
  }
};

const addParcelleCadastrale = async () => {
  await searchReference(null);
  if (feature.value === null) {
    return;
  } else {
    emit("feature", feature.value);
    emit("close");
  }
};

function cleanPrefix(value) {
  return value.replace(/^0+(?=\d|[A-Za-z])/g, "");
}

// Update reference when input values change
watch([prefix, section, number], () => {
  if (feature.value !== null) {
    feature.value = null;
  }

  if (cadastreRequestController.value) {
    cadastreRequestController.value.abort();
  }

  isFetchingGeometry.value = false;
});

watch(
  () => props.commune,
  (val) => {
    communeRef.value = val || null;
  },
);
</script>
