<script setup>
defineEmits(['center', 'update:large'])
defineProps({
  large: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <Teleport to=".cartobio-controls">
    <button type="button" title="Centrer sur l'exploitation" aria-label="Center sur l'exploitation" @click="$emit('center')">
      <span class="fr-icon-map-pin-user-fill" aria-hidden="true"></span>
    </button>
    <button v-if="!large" type="button" title="Agrandir la carte" aria-label="Agrandir la carte" @click="$emit('update:large', true)">
      <span class="fr-icon- icon-enlarge" aria-hidden="true"></span>
    </button>
    <button v-else type="button" title="Réduire la carte" aria-label="Réduire la carte" @click="$emit('update:large', false)">
      <span class="fr-icon- icon-shrink" aria-hidden="true"></span>
    </button>
  </Teleport>
</template>

<style scoped>
.icon-shrink::before {
  mask-image: url(@/assets/map/icon-shrink.svg);
}

.icon-enlarge::before {
  mask-image: url(@/assets/map/icon-enlarge.svg);
}
</style>
