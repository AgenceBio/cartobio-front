import { defineStore } from "pinia";
import { useStorageAsync } from "@vueuse/core";

const defaultMapPreferences = () => ({
  background: "plan",
  cadastre: false,
  rpg: false,
});

export const usePreferences = defineStore("preferences", () => {
  const map = useStorageAsync("cartobio/preferences/map", defaultMapPreferences(), localStorage, {
    mergeDefaults: true,
  });

  function $reset() {
    map.value = defaultMapPreferences();
  }

  return {
    // domains
    map,
    // utility
    $reset,
  };
});
