<script setup lang="ts">
type ButtonConfig = {
  label: string;
};

type Props = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description: string;

  total?: number;
  activeIndex?: number;

  button?: ButtonConfig;
  imagePosition?: "left" | "right";
};

withDefaults(defineProps<Props>(), {
  imagePosition: "left",
});

const emit = defineEmits<{
  (_: "update:activeIndex", index: number): void;
  (_: "action"): void;
}>();

const onDotClick = (index: number) => {
  emit("update:activeIndex", index);
};

const onButtonClick = () => {
  emit("action");
};
</script>

<template>
  <section class="fr-container">
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle"
      :class="imagePosition === 'right' ? 'fr-grid-row--reverse' : ''"
    >
      <div class="fr-col-12 fr-col-md-6 fr-text--center">
        <img :src="imageSrc" :alt="imageAlt || ''" class="fr-responsive-img fr-radius--lg fr-shadow" />
      </div>

      <div class="fr-col-12 fr-col-md-6">
        <h2 class="fr-h2">
          {{ title }}
        </h2>

        <p class="fr-text--lg fr-mt-3w fr-mb-6w" v-html="description"></p>

        <template v-if="button">
          <button type="button" class="fr-btn fr-btn--primary" @click="onButtonClick">
            {{ button.label }}
          </button>
        </template>

        <template v-else>
          <ul class="onboarding-dots" role="tablist" aria-label="Étapes de l’onboarding">
            <li v-for="index in total" :key="index" role="presentation">
              <button
                type="button"
                class="onboarding-dot"
                :class="{ 'is-active': index - 1 <= activeIndex }"
                role="tab"
                :aria-selected="index - 1 === activeIndex"
                @click="onDotClick(index - 1)"
              >
                <span class="fr-sr-only"> Étape {{ index }} </span>
              </button>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.onboarding-dots {
  display: flex;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.onboarding-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: var(--border-default-grey);
  cursor: pointer;
  padding: 0;
}

.onboarding-dot.is-active {
  background-color: var(--text-action-high-blue-france);
}

.onboarding-dot:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
