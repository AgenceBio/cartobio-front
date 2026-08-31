import { defineStore } from "pinia";
import { useStorageAsync } from "@vueuse/core";
import { ref } from "vue";

const defaultLayers = () => ({
  background: "plan",
  cadastre: false,
  rpg: false,
});

const defaultParams = () => ({
  currentMode: "consult",
  blockPlan: false,
  hasUndo: false,
});

export const usePreferences = defineStore("preferences", () => {
  const layers = useStorageAsync("cartobio/preferences/map", defaultLayers(), localStorage, {
    mergeDefaults: true,
  });

  const unit = useStorageAsync("cartobio/preferences/unit", "week", localStorage);

  const params = ref(defaultParams());

  function $reset() {
    layers.value = defaultLayers();
    params.value = defaultParams();
  }

  return {
    layers,
    unit,
    params,
    $reset,
  };
});
