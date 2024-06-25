<template>
  <label v-if="$slots.default" :for="id">
    <slot name="default" />
  </label>

  <button v-if="showControl" type="button" :aria-pressed="isAscending || isDescending" :id="id" class="fr-btn fr-btn--tertiary-no-outline" @click="emit('update:modelValue', { sort: code, order: !isAscending ? 'asc' : 'desc' })" :aria-label="`Trier par ${$slots.default()[0].children.toLocaleLowerCase()}`">
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0L13 6H1L7 0Z" :fill="isAscending ? '#000091' : '#929292'"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7 16L1 10L13 10L7 16Z" :fill="isDescending ? '#000091' : '#929292'"/>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  modelValue: {
    type: Object,
    required: true
  },
  showControl: {
    type: Boolean,
    default : true
  }
})

const isAscending = computed(() => props.modelValue.sort === props.code && props.modelValue.order === 'asc')
const isDescending = computed(() => props.modelValue.sort === props.code && props.modelValue.order === 'desc')
const id = computed(() => `sort-order-${props.code}`)
</script>

<style scoped>
label,
button {
  cursor: pointer;
  vertical-align: middle;
}

button {
  padding: .5rem;
}
</style>
