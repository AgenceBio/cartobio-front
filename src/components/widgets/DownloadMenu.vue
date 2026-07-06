<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

export type DownloadAction = {
  id: string;
  label: string;
  icon?: string;
};

const props = defineProps<{
  label: string;
  actions: DownloadAction[];
}>();

const emit = defineEmits<{
  (event: "select", actionId: string): void;
}>();

const isOpen = ref(false);
const menuId = `download-menu-${crypto.randomUUID()}`;
const containerRef = ref<HTMLElement | null>(null);

const triggerLabel = computed(() => `Télécharger : ${props.label}`);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

function select(actionId: string) {
  emit("select", actionId);
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

function onClickOutside(event: MouseEvent) {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("click", onClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("click", onClickOutside, true);
});
</script>

<template>
  <div class="download-menu" ref="containerRef">
    <button
      type="button"
      class="fr-btn fr-btn--tertiary-no-outline fr-icon-more-line"
      :aria-controls="menuId"
      :aria-expanded="isOpen"
      :title="triggerLabel"
      @click="toggle"
    >
      <span class="fr-sr-only">{{ triggerLabel }}</span>
    </button>

    <div :id="menuId" class="download-menu__panel fr-menu" v-show="isOpen">
      <ul class="fr-menu__list" :aria-label="`Formats de téléchargement : ${label}`">
        <li v-for="action in actions" :key="action.id">
          <button type="button" class="fr-menu__link" @click="select(action.id)">
            <span v-if="action.icon" :class="action.icon" aria-hidden="true"></span>
            {{ action.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.download-menu {
  position: relative;
  flex: 0 0 auto;
}

.download-menu__panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.25rem);
  right: 0;
  min-width: 15rem;
}

.download-menu__panel .fr-menu__link {
  width: 100%;
  text-align: left;
}

@media (max-width: 48rem) {
  .download-menu__panel {
    right: auto;
    left: 0;
    width: max-content;
    max-width: calc(100vw - 2rem);
  }
}
</style>
