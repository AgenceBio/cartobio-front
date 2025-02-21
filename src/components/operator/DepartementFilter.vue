<template>
  <div>
    <div class="fr-search-bar fr-search-bar" id="header-search" role="search">
      <label class="fr-label" for="search"> Recherche </label>
      <input
        class="fr-input"
        placeholder="Rechercher"
        minlength="1"
        v-model.trim="userInputDepartement"
        autofocustype="search"
        id="search"
      />
      <button class="fr-btn" type="submit" title="Rechercher" :disabled="isSearching" />
    </div>
    <fieldset
      class="fr-fieldset departement-checkbox fr-mt-2v"
      id="checkboxes-small"
      aria-labelledby="checkboxes-small-legend checkboxes-small-messages"
    >
      <div v-for="(departements, region) in departementsList" :key="region">
        <h6 class="fr-mb-2v">{{ region }}</h6>
        <button @click="toggleRegion(departements)" class="fr-btn fr-btn--sm fr-btn--tertiary fr-mt-0 fr-mb-2w">
          Tout {{ region }}
        </button>
        <div v-for="element in departements" :key="element.code" class="fr-fieldset__element">
          <div class="fr-checkbox-group fr-checkbox-group--sm">
            <input
              :name="'checkboxes-small-' + element.code"
              :id="'checkboxes-small-' + element.code"
              type="checkbox"
              :value="element"
              v-model="selectedDepartements"
              :aria-describedby="'checkboxes-small-' + element.code + 'message'"
              :disabled="isSearching"
              @change="$emit('update:modelValue', selectedDepartements)"
            />
            <label class="fr-label" :for="'checkboxes-small-' + element.code">
              {{ `${element.nom} (${element.code})` }}
            </label>
            <div
              class="fr-messages-group"
              :id="'checkboxes-small-' + element.code + 'message'"
              aria-live="assertive"
            ></div>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { getDepartements } from "@/cartobio-api";

const isSearching = ref(false);

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
  initialValue: {
    type: [Array, String],
    default: () => [],
  },
});

// Départements filtres


const selectedDepartements = ref([...props.modelValue]);
const userInputDepartement = ref("");
const departements = ref([]);

const emit = defineEmits(["update:modelValue"]);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDepartements.value = [...newValue];
  },
  { deep: true }
);


onMounted(async () => {
  departements.value = await getDepartements();

  if (props.initialValue.length > 0) {
    const searchedDep = Array.isArray(props.initialValue) ? props.initialValue : [props.initialValue];

    searchedDep.map((v) => {
      const dep = Object.values(departements.value)
        .flat()
        .find((d) => d.code === v);

      if (dep) {
        selectedDepartements.value.push(dep);
      }
    });

    console.log(selectedDepartements.value, searchedDep);
    emit("update:modelValue", selectedDepartements.value);
  }
});

const departementsList = computed(() => {
  const searchTerm = userInputDepartement.value.trim().toLowerCase();

  if (!searchTerm) return departements.value;

  const filteredDepartements = {};

  for (const region in departements.value) {
    const filtered = departements.value[region].filter((dep) => {
      const nomSansAccent = removeAccents(dep.nom.toLowerCase());
      const searchSansAccent = removeAccents(searchTerm);
      return (
        nomSansAccent.includes(searchSansAccent) ||
        (!isNaN(searchTerm) ? parseInt(searchTerm) === parseInt(dep.code) : false)
      );
    });

    if (filtered.length > 0) {
      filteredDepartements[region] = filtered;
    }
  }

  return filteredDepartements;
});

const toggleRegion = (departements) => {
  const selectedCodes = new Set(selectedDepartements.value.map((d) => d.code));

  const selectedCount = departements.filter((d) => selectedCodes.has(d.code)).length;

  if (selectedCount === departements.length) {
    selectedDepartements.value = selectedDepartements.value.filter(
      (d) => !departements.some((dep) => dep.code === d.code),
    );
  } else {
    const newSelection = departements.filter((d) => !selectedCodes.has(d.code));
    selectedDepartements.value = [...selectedDepartements.value, ...newSelection];
  }

  emit("update:modelValue", selectedDepartements.value);
};

// Utils

const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
</script>

<style scoped>
.fr-fieldset.departement-checkbox {
  margin: 0rem;
  max-height: 400px;
  overflow: auto;
}
</style>
