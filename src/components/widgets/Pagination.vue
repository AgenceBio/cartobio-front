<template>
  <ul class="fr-btns-group fr-btns-group--center fr-btns-group--inline fr-btns-group--pagination">
    <li>
      <div class="fr-select-group fr-select-group--inline">
        <select
          class="fr-select"
          id="search-results-page-selector"
          name="page"
          :value="currentPage"
          @change="(event) => $emit('changePage', parseInt(event.target.value))"
        >
          <option value="" disabled hidden>Sélectionner un numéro de pagination</option>
          <option :value="page" :key="page" v-for="page in maxPage">{{ page }}</option>
        </select>
        <label class="fr-label" for="search-results-page-selector"> sur {{ maxPage }} pages </label>
      </div>
    </li>
    <li>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-left-s-line pagination-page-previous"
        :disabled="maxPage < 2 || currentPage === 1"
        @click="$emit('changePage', currentPage - 1)"
      >
        Page précédente
      </button>
    </li>
    <li>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-s-line pagination-page-next"
        :disabled="maxPage < 2 || currentPage === maxPage"
        @click="$emit('changePage', currentPage + 1)"
      >
        Page suivante
      </button>
    </li>
  </ul>
</template>

<script setup>
defineProps(['currentPage', 'maxPage']);
defineEmits('changePage');
</script>

<style scoped>
.fr-btns-group--pagination {
  .fr-label, .fr-select {
    font-size: inherit;   /* reset size so as they are consistent */
  }

  .fr-btn {
    margin: 0;
  }
}

.fr-select-group--inline {
  display: flex;
  align-items: center;

  select {
    background-color: transparent;
    box-shadow: none;
    text-align: right;
    width: 6rem; /* up to 3 digits, so 999 pages */
  }
}
</style>
