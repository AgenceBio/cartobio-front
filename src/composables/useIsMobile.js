import { computed } from "vue";
import { useWindowWidth } from "./useWindowWidth";

export const useIsMobile = () => {
  const windowWidth = useWindowWidth();
  const isMobile = computed(() => {
    return windowWidth.value < 768;
  });

  return isMobile;
};
