<template>
  <fieldset
    role="list"
    class="fr-segmented fr-pb-6v"
    :class="{ 'fr-hidden': model !== 'parcellaire', 'fr-unhidden-lg': model !== 'parcellaire' }"
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
        <label class="fr-label" :for="`${id}-synthese`">Synthèse</label>
      </div>
      <div class="fr-segmented__element" role="listitem">
        <input type="radio" :id="`${id}-liste`" value="liste-parcelles" v-model="model" />
        <label class="fr-label" :for="`${id}-liste`">Liste des parcelles</label>
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
