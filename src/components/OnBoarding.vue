<template>
  <div v-if="showOnboarding" class="onboarding-overlay">
    <div class="onboarding-container">
      <div class="onboarding-content">
        <component
          :is="currentSlideValue.component"
          v-bind="currentSlideValue.props"
          :total="slides.length - 1"
          :activeIndex="currentSlide - 1"
          @update:activeIndex="(e) => (currentSlide = e + 1)"
          @action="actionButton()"
        />
      </div>

      <div class="onboarding-footer">
        <div class="onboarding-actions">
          <div>
            <button
              type="button"
              class="fr-btn fr-icon-close-line fr-btn--icon-right fr-btn--tertiary-no-outline"
              @click="skipOnboarding()"
            >
              Passer la présentation
            </button>
          </div>
          <div class="onboarding-actions-button-nav">
            <button
              :disabled="currentSlide <= 0"
              class="fr-btn--secondary fr-btn--sm fr-icon-arrow-left-s-line"
              @click="previousSlide"
            ></button>
            <button
              :disabled="currentSlide >= slides.length - 1"
              class="fr-btn fr-btn--sm fr-icon-arrow-right-s-line"
              @click="nextSlide"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import SlideHeader from "./onboarding/slideHeader.vue";
import SlideComposable from "./onboarding/slideComposable.vue";
import slide1 from "@/assets/onboarding/slide1.png";

const showOnboarding = ref(false);
const currentSlide = ref(0);

const STORAGE_KEY = "checkOnBoarding";

const slides = [
  { component: SlideHeader },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "Une nouvelle navigation",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "La page exploitation",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "Un nouvel outil cartographique",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "Modulez votre écran",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "La fiche parcelle",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide1,
      title: "De nouveaux outils",
      description: "Nisl eget suspendisse nunc pellentesque consectetur nunc.",
      button: {
        label: "C'est parti !",
      },
    },
  },
];

const currentSlideValue = computed(() => {
  return slides[currentSlide.value];
});

onMounted(() => {
  checkOnboardingStatus();
});

const checkOnboardingStatus = () => {
  const value = localStorage.getItem(STORAGE_KEY);
  showOnboarding.value = !(value === "true");
};

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++;
  }
};

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKey);
});

function handleKey(e) {
  if (e.key === "ArrowLeft") previousSlide();
  if (e.key === "ArrowRight") nextSlide();
}

const skipOnboarding = () => {
  showOnboarding.value = false;
  saveOnboardingVersion();
};

const actionButton = () => {
  skipOnboarding();
};

const saveOnboardingVersion = () => {
  localStorage.setItem(STORAGE_KEY, "true");
};
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.onboarding-container {
  background: white;
  border-radius: 0.25rem;
  max-width: 80%;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.onboarding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--border-default-grey);
}

.onboarding-header h1 {
  margin: 0;
  color: var(--text-title-grey);
}

.onboarding-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.onboarding-footer {
  padding: 1.5rem 2rem 2rem;
  border-top: 1px solid var(--border-default-grey);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.onboarding-pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pagination-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #e5e5e5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background-color: var(--background-action-high-blue-france);
  width: 2rem;
  border-radius: 0.375rem;
}

.pagination-dot:hover {
  background-color: #d0d0d0;
}

.onboarding-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.onboarding-actions-button-nav {
  gap: 5px;
  display: flex;
}
</style>
