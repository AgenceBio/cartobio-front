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
          @explore="() => (currentSlide = currentSlide + 1)"
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
          <div class="onboarding-actions-button-nav" v-if="currentSlide > 0">
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
import comparaisonslide from "@/assets/onboarding/comparaisonslide.png";
import slide2 from "@/assets/onboarding/slide2.png";
import slide3 from "@/assets/onboarding/slide3.png";
import slide4 from "@/assets/onboarding/slide4.png";
import slide5 from "@/assets/onboarding/slide5.png";
import slide6 from "@/assets/onboarding/slide6.png";
import slide7 from "@/assets/onboarding/slide7.png";
import { useOnboardingStore } from "@/stores/onboarding.js";

const onboardingStore = useOnboardingStore();

const showOnboarding = computed(() => onboardingStore.shouldShow);

const currentSlide = ref(0);

const slides = [
  { component: SlideHeader },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide2,
      title: "Une nouvelle navigation",
      description:
        "Passer facilement de votre espace au site grand public sans vous déconnecter ! <br/> Un accès rapide à toutes les pages de CartoBio. <br/> Une FAQ pour répondre à vos questions les plus fréquentes !",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide3,
      title: "La page exploitation",
      description:
        "<ul><li>Un rappel des informations de l'exploitation permettant de vérifier qu'il s'agit du bon dossier et que les données sont à jour</li><li>Un résumé du dernier contrôle donnant l'état de l'exploitation en un clin d'oeil</li><li>L'ensemble des parcellaires et contrôles réalisés pour retrouver l'historique</li>",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide4,
      title: "Une refonte de l'espace cartographique",
      description:
        "Pour gérer les parcellaires, modifier ou ajouter facilement des parcelles...<br/>Une vue synthèse pour faciliter vos contrôles<br/>La liste des parcelles revisitée ",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide7,
      title: "De nouveaux outils",
      description: "Pour dessiner, ajouter une parcelle en un clic, modifier ou fusionner vos parcelles",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: comparaisonslide,
      title: "Comparaison de vos versions",
      description: "Pour consulter en parallèle deux versions du parcellaire",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide5,
      title: "Modulation de votre écran",
      description: "3 vues proposées : partagée tableau/carte, plein écran carto ou tableau ",
    },
  },
  {
    component: SlideComposable,
    props: {
      imageSrc: slide6,
      title: "La fiche parcelle",
      description: 'Nouveautés : Historique des cultures, marquer comme "vu"',
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
  onboardingStore.checkStatus();
});

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
  onboardingStore.complete();
};

const actionButton = () => {
  skipOnboarding();
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
  width: 1172px;
  height: 741px;
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
