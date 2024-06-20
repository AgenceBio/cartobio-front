<template>
  <p class="loading-message">
    <span class="loader-animation" aria-hidden>...</span>

    <slot />
  </p>
</template>

<style scoped>
@keyframes leading-dot-loading {
  to {
    clip-path: inset(0 -1ch 0 0);
  }
}

.loader-animation {
  animation: leading-dot-loading 2s steps(4) infinite;
  clip-path: inset(0 3ch 0 0);
  display: inline-block;
  font-family: monospace;
  font-size: .8em;
  margin-right: .5rem;
}
</style>
