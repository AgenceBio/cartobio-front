import { defineStore } from "pinia";
import { ref } from "vue";

export const useOnboardingStore = defineStore("onboarding", () => {
  const shouldShow = ref(false);

  const checkStatus = () => {
    const value = localStorage.getItem("checkOnBoarding");
    shouldShow.value = !(value === "true");
    // TODO : Uniquement quand on es connecté
  };

  const reset = () => {
    localStorage.setItem("checkOnBoarding", "false");
    checkStatus();
  };

  const complete = () => {
    localStorage.setItem("checkOnBoarding", "true");
    shouldShow.value = false;
  };

  return { shouldShow, checkStatus, reset, complete };
});
