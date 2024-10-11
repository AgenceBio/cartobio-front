<template>
  <p class="spin" aria-label="Chargement en cours…">
    <slot name="default" />
  </p>
</template>

<style scoped>
@keyframes spinner {
  0% {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
}
.spin {
  display: inline-block;
  height: 40px;
  padding-left: calc(40px + 1rem);
  line-height: 40px;
  position: relative;
}
.spin::before {
  animation: 0.7s linear infinite spinner;
  animation-play-state: inherit;
  border: solid 5px var(--background-alt-grey-hover);
  border-bottom-color: var(--background-action-high-blue-france);
  border-radius: 50%;
  content: "";
  height: 40px;
  width: 40px;
  top: 20px;
  left: 20px;
  position: absolute;
  transform: translate3d(-50%, -50%, 0);
  will-change: transform;
}
</style>
