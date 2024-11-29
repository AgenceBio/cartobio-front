import { computed, onMounted, onUnmounted, ref } from "vue";

export const useWindowWidth = () => {
  const windowWidth = ref(window.innerWidth);
  const width = computed(() => windowWidth.value);

  const onWidthChange = () => (windowWidth.value = window.innerWidth);
  onMounted(() => window.addEventListener("resize", onWidthChange));
  onUnmounted(() => window.removeEventListener("resize", onWidthChange));

  return width;
};
