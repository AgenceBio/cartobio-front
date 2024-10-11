import { onMounted } from "vue";

/**
 * @param {Array} args
 */
export function statsPush(args) {
  if (typeof window?._paq?.push === "function") {
    window._paq.push(args);
  }
}

export const CUSTOM_DIMENSION_ROLE = 1;
export const CUSTOM_DIMENSION_DEPARTEMENT = 2;

export function setCustomDimension(index, value) {
  statsPush(["setCustomDimension", index, value]);
}

export function deleteCustomDimension(index) {
  statsPush(["deleteCustomDimension", index]);
}

export function useContentTracking() {
  onMounted(() => {
    statsPush(["trackAllContentImpressions"]);
  });
}
