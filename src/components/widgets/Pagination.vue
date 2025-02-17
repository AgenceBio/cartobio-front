<template>
  <nav role="navigation" class="fr-pagination" aria-label="Pagination">
    <ul class="fr-pagination__list">
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--first"
          :disabled="currentPage === 1"
          @click="$emit('changePage', 1)"
        >
          Première page
        </button>
      </li>
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
          :disabled="currentPage === 1"
          @click="$emit('changePage', currentPage - 1)"
        >
          Page précédente
        </button>
      </li>
      <li v-for="page in visiblePages" :key="page">
        <button
          class="fr-pagination__link"
          :class="{ 'fr-pagination__link--current': page === currentPage }"
          @click="$emit('changePage', page)"
        >
          {{ page }}
        </button>
      </li>
      <li v-if="currentPage < maxPage - 2">
        <span class="fr-pagination__link fr-displayed-lg">…</span>
      </li>
      <li v-if="maxPage > 1">
        <button class="fr-pagination__link fr-displayed-lg" @click="$emit('changePage', maxPage)">
          {{ maxPage }}
        </button>
      </li>
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
          :disabled="currentPage === maxPage"
          @click="$emit('changePage', currentPage + 1)"
        >
          Page suivante
        </button>
      </li>
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--last"
          :disabled="currentPage === maxPage"
          @click="$emit('changePage', maxPage)"
        >
          Dernière page
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: Number,
  maxPage: Number,
});

defineEmits(["changePage"]);

const visiblePages = computed(() => {
  if (props.maxPage <= 5) {
    return Array.from({ length: props.maxPage }, (_, i) => i + 1);
  }

  const pages = [1];
  if (props.currentPage > 3) pages.push("…");
  const start = Math.max(2, props.currentPage - 1);
  const end = Math.min(props.maxPage - 1, props.currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<style scoped>
.fr-pagination__link {
  margin: 0 4px;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
}

.fr-pagination__link--current {
  font-weight: bold;
  text-decoration: underline;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
