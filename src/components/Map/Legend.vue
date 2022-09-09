<template>
  <div class="fr-card fr-card--horizontal fr-card--shadow fr-m-3w">
    <div class="fr-card__body">
      <div class="fr-card__content fr-p-1w">
        <div class="fr-card__desc fr-m-0"><slot /></div>
        <div class="fr-card__start" v-if="$slots.start">
          <slot name="start" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fr-card {
    bottom: 0;
    position: absolute;
    max-width: 32em;
  }

  .fr-card__desc :first-child {
    margin-top: 0;
  }
  .fr-card__desc :last-child {
    margin-bottom: 0;
  }
</style>
