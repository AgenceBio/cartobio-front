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
      <template v-for="page in visiblePages" :key="page">
        <li>
          <button
            class="fr-pagination__link"
            :class="{ [`fr-pagination__link--${page}`]: true }"
            @click="$emit('changePage', page)"
            :aria-current="currentPage == page"
          >
            {{ page }}
          </button>
        </li>
        <li v-if="!isMobile && currentPage > 3 && page === 1">
          <span class="fr-pagination__link fr-displayed-lg">…</span>
        </li>
      </template>
      <li v-if="!isMobile && currentPage < maxPage - 2">
        <span class="fr-pagination__link fr-displayed-lg">…</span>
      </li>
      <li v-if="!isMobile && maxPage > 2 && !visiblePages.includes(maxPage)">
        <button
          class="fr-pagination__link fr-displayed-lg"
          @click="$emit('changePage', maxPage)"
          :aria-current="currentPage == maxPage"
        >
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
import { useIsMobile } from "@/composables/useIsMobile";
import { computed } from "vue";

const props = defineProps({
  currentPage: Number,
  maxPage: Number,
});

defineEmits(["changePage"]);

const isMobile = useIsMobile();

const visiblePages = computed(() => {
  if (!isMobile.value) {
    if (props.maxPage <= 5) {
      return Array.from({ length: props.maxPage }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, props.currentPage - 1);
    const end = Math.min(props.maxPage - 1, props.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  } else {
    if (props.maxPage <= 3) {
      return Array.from({ length: props.maxPage }, (_, i) => i + 1);
    }

    if (props.currentPage === 1) {
      return [1];
    } else if (props.currentPage === 2) {
      return [1, 2];
    } else if (props.currentPage === props.maxPage) {
      return [props.maxPage - 2, props.maxPage - 1, props.maxPage];
    } else if (props.currentPage === props.maxPage - 1) {
      return [props.currentPage - 1, props.currentPage, props.maxPage];
    } else {
      return [props.currentPage - 1, props.currentPage, props.currentPage + 1];
    }
  }
});
</script>

<style scoped>
ul {
  justify-content: center;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
