<template>
  <div class="horizontal-stack">
    <div class="fr-input-group">
      <label :for="`parcel-prefix-${fieldId}`" class="fr-label">Préfixe (facultatif)</label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-prefix-${fieldId}`" v-model="props.prefix" />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-section-${fieldId}`" class="fr-label">Section</label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-section-${fieldId}`" v-model="props.section" required />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-number-${fieldId}`" class="fr-label" aria-label="Numéro de parcelle">N° de parcelle</label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-number-${fieldId}`" v-model="props.number" required />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  parcel: {
    type: Object,
    required: true
  }
})

const fieldId = ref(crypto.randomUUID())
</script>

<style scoped>
.horizontal-stack {
  display: flex;
  gap: 1em;
}
</style>
