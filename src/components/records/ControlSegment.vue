<template>
  <fieldset
    role="list"
    class="fr-segmented"
    :class="{ 'fr-unhidden-lg': model !== 'parcellaire' }"
    aria-labelledby="viewmode-switcher-heading"
  >
    <legend
      class="fr-segmented__legend fr-sr-only"
      id="viewmode-switcher-heading"
      aria-label="Choix de l'onglet affiché"
    >
      Choix de l'onglet affiché
    </legend>

    <div class="fr-segmented__elements">
      <div class="fr-segmented__element" role="listitem">
        <input type="radio" :id="`${id}-synthese`" value="synthese" v-model="model" />
        <label class="fr-label" :for="`${id}-synthese`">
          <span class="fr-icon-clipboard-line fr-mr-1v fr-icon--sm" aria-hidden="true"></span>Synthèse</label
        >
      </div>
      <div class="fr-segmented__element" role="listitem">
        <input type="radio" :id="`${id}-liste`" value="liste-parcelles" v-model="model" />
        <label class="fr-label" :for="`${id}-liste`">
          <span class="fr-icon-list-unordered fr-mr-1v fr-icon--sm" aria-hidden="true"></span>Parcelles</label
        >
      </div>
    </div>
  </fieldset>
</template>

<script setup>
defineProps({
  modelValue: String,
  id: { type: String, default: "tab" },
});

defineEmits(["update:modelValue"]);

const model = defineModel();
</script>

<style scoped>
.fr-segmented {
  width: fit-content;
}
</style>
