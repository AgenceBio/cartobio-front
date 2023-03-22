<template>
  <dialog aria-labelledby="modal-title" role="dialog" id="global-modal" :class="{'fr-modal': true, 'fr-modal--opened': modelValue}" :open="modelValue">
    <div ref="target" class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button class="fr-btn--close fr-btn" title="Fermer la fenêtre modale" aria-controls="global-modal" @click="emit('update:modelValue', false)">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="modal-title" class="fr-modal__title">
                <span :class="['fr-icon', icon, 'fr-mr-1w']" v-if="icon" />
                <slot name="title" />
              </h1>

              <slot name="default" v-bind="$attrs" />
            </div>

            <div class="fr-modal__footer"><slot name="footer" /></div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { useHead } from '@unhead/vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
  icon: String
})

const target = ref(null)
onClickOutside(target, () => emit('update:modelValue', false))
onKeyStroke('Escape', () => emit('update:modelValue', false))

const stop = watchEffect(() => {
  if (props.modelValue) {
    useHead({
      htmlAttrs: {
        'data-fr-scrolling': props.modelValue,
        tagDuplicateStrategy: 'replace'
      }
    })
  }
})

onBeforeUnmount(() => {
  stop()

  useHead({
    htmlAttrs: {}
  })
})
</script>

<style scoped>
.fr-modal__footer:empty {
  display: none;
}
</style>
