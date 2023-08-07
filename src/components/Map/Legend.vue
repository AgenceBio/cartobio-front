<template>
  <div
    :class="{
      'fr-card--bottom-left': !position || position === 'bottom-left',
      'fr-card--top-left': position === 'top-left',
      'fr-card--bottom-right': position === 'bottom-right',
      'fr-card--top-right': position === 'top-right'
    }"
    class="fr-card fr-card--horizontal fr-card--shadow fr-m-3w"
  >
    <div class="fr-card__body">
      <div class="fr-card__content fr-p-1w">
        <div class="fr-card__desc fr-m-0">
          <slot />
        </div>
        <div
          class="fr-card__start"
          v-if="$slots.start"
        >
          <slot name="start" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  position: {
    type: String,
    default: 'bottom-left'
  }
})
</script>

<style scoped>
  .fr-card {
    position: absolute;
    max-width: 32em;
    height: auto;
  }

  .fr-card--bottom-left {
    bottom: 0;
  }

  .fr-card--top-left {
    top: 0;
  }

  .fr-card--bottom-right {
    bottom: 0;
    right: 0;
  }

  .fr-card--top-right {
    top: 0;
    right: 0;
  }

  .fr-card__desc :first-child {
    margin-top: 0;
  }
  .fr-card__desc :last-child {
    margin-bottom: 0;
  }
</style>
