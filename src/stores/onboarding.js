import { defineStore } from "pinia";
import { ref } from "vue";
import { useUserStore } from "@/stores/user.js";

export const useOnboardingStore = defineStore("onboarding", () => {
  const shouldShow = ref(false);
  const userStore = useUserStore();

  const checkStatus = () => {
    const value = localStorage.getItem("checkOnBoarding");
    shouldShow.value = !(value === "true") && userStore.isLogged;
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
