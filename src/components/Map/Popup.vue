<template>
  <div
    class="popup"
    id="popup-content"
    :style="{ maxWidth }"
  >
    <div ref="popupRef">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, toRaw, watch } from 'vue'
import { Popup } from 'maplibre-gl'

const map = inject('map')
const popupRef = ref(null)

const props = defineProps({
  lnglat: {
    type: Array,
    default() {
      return [0, 0]
    }
  },
  maxWidth: {
    type: String,
    default: '450px'
  },
  offset: {
    type: Array,
    default() {
      return [0, -15]
    }
  },
})

const emit = defineEmits(['popup:closed'])

const popup = shallowRef(null)
provide('popup', popup)

onMounted(() => {
  popup.value = new Popup({
    offset: props.offset,
    maxWidth: props.maxWidth,
    closeButton: true,
    closeOnClick: false
  })
  .addTo(map.value)

  popup.value.on('close', () => emit('popup:closed'))
})

watch(() => props.lnglat, () => {
  nextTick(() => {
    popup.value
      .setLngLat(toRaw(props.lnglat))
      .setDOMContent(popupRef.value)
  })
}, { immediate: true })

onBeforeUnmount(() => popup.value.remove())
</script>


