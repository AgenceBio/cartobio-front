<template>
  <code class="reference-cadastrale" :title="reference" :data-ref="reference">
    <span class="reference--section">{{ parsedReference.section }}</span>
    <span class="reference--number">{{ parsedReference.number }}</span>
  </code>
</template>

<script setup>
import { computed } from "vue";
import { parseReference } from "@/utils/cadastre.js";

const props = defineProps({
  reference: {
    type: String,
    required: true,
  },
});

const parsedReference = computed(() => parseReference(props.reference));
</script>

<style scoped>
.reference--section {
  margin-right: 0.3rem;
}
</style>
