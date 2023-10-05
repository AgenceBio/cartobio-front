<template>
  <section class="fr-accordion">
    <h3 class="fr-accordion__title">
      <button class="fr-accordion__btn" :aria-expanded="isOpen" @click="isOpen = !isOpen" :aria-controls="elementId" type="button">
        {{ title }}
      </button>
    </h3>

    <div :class="{ 'fr-collapse': true, 'fr-collapse--expanded': isOpen }" :id="elementId">
      <slot name="default" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  }
})

const elementId = ref(`accordion-${crypto.randomUUID()}`)
const isOpen = ref(props.open)
</script>

<style scoped>
.fr-collapse {
  --collapse-max-height: none;
}
</style>
