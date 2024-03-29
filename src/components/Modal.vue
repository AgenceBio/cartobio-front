<template>
  <dialog aria-labelledby="modal-title" role="dialog" id="global-modal" class="fr-modal fr-modal--opened" open>
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div ref="target" class="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <h1 id="modal-title" class="fr-modal__title fr-m-0 fr-mt-2w">
                <span :class="['fr-icon', icon, 'fr-mr-1w']" v-if="icon" />
                <slot name="title" />
              </h1>

              <button class="fr-btn--close fr-btn" title="Fermer la fenêtre modale" aria-controls="global-modal" @click="emit('close')" v-if="!noCloseButton">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">


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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useContentTracking } from "@/stats.js"

useContentTracking()

const emit = defineEmits(['close'])
defineProps({
  icon: String,
  noCloseButton: Boolean,
})

const target = ref(null)

const cancelKeyStroke = onKeyStroke('Escape', () => emit('close'))
const cancelClickOutside = onClickOutside(target, (event) => {
  const range = document.createRange()
  range.selectNode(target.value)
  const isOutside = range.intersectsNode(event.target)

  if (isOutside) {
    emit('close')
  }
})

onMounted(() => {
  useHead({
    htmlAttrs: {
      'data-fr-scrolling': true,
      tagDuplicateStrategy: 'replace'
    }
  })
})

onBeforeUnmount(() => {
  useHead({
    htmlAttrs: {
      'data-fr-scrolling': false,
      tagDuplicateStrategy: 'replace'
    }
  })
  cancelClickOutside()
  cancelKeyStroke()

  useHead({
    htmlAttrs: {}
  })
})
</script>

<style scoped>
.fr-modal__title {
  align-items: flex-start;
}
.fr-modal__footer {
  filter: drop-shadow(var(--lifted-shadow));
  z-index: calc(var(--ground) + 2000); /* same as .fr-modal__body in DSFR */
}
.fr-modal__footer:empty {
  display: none;
}
</style>
