<template>
  <div class="fr-accordions-group">
    <slot name="default" />
  </div>
</template>

<script setup>
import { provide, ref } from "vue";

const props = defineProps({
  constraintToggle: {
    type: Boolean,
    default: true,
  },
});

const openElement = ref(null);

if (props.constraintToggle) {
  provide("openAccordion", openElement);
}
</script>

<style scoped>
.fr-collapse {
  --collapse-max-height: none;
}
</style>
