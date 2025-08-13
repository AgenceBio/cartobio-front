<template>
  <div class="loading" :class="[fullScreen ? 'fullscreen' : '']">
    <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" :stroke="color">
      <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="2">
          <circle stroke-opacity=".25" cx="18" cy="18" r="18" />

          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  width: Number,
  height: Number,
  color: String,
  fullScreen: Boolean,
});
</script>

<style scoped>
.loading {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  align-items: center;
  display: none;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
  display: flex;
  height: 100vh;
  background: #808080;
  opacity: 0.7;
  width: 100vw;
}

.fullscreen {
  position: fixed;
}
</style>
