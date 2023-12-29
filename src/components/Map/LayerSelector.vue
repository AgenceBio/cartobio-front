<script setup>
import { ref } from "vue"

const showMenu = ref(false)

defineProps({
  fond: {
    type: String,
    required: true,
  },
  classification: {
    type: Boolean,
    required: true,
  },
  cadastre: {
    type: Boolean,
    required: true,
  },
  ilots: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['update:fond', 'update:classification', 'update:cadastre', 'update:ilots'])
</script>

<template>
<Teleport to=".maplibregl-ctrl-bottom-left">
  <div class="container maplibregl-ctrl">
    <button
      class="menu-toggle"
      :class="{ 'menu-toggle--satellite': fond === 'satellite', 'menu-toggle--plan': fond === 'plan' }"
      @click="showMenu = !showMenu"
    >
      <span class="fr-icon--sm fr-mb-1v">
        Cartes
      </span>
    </button>
    <div class="menu" v-if="showMenu">
      <h5 class="fr-mb-2w">Cartes</h5>
      <button
        class="close-button fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-right fr-icon-close-line"
        @click="showMenu = false"
      >Fermer</button>

      <h6 class="fr-my-2w fr-text--md">Fonds de carte</h6>
      <button class="menu-entry" :class="{ 'active': fond === 'plan' }" @click="$emit('update:fond', 'plan')">
        <img src="@/assets/map/plan.jpg" alt="Fond plan" />
        <span>Plan</span>
      </button>
      <button class="menu-entry" :class="{ 'active': fond === 'satellite' }" @click="$emit('update:fond', 'satellite')">
        <img src="@/assets/map/satellite.jpg" alt="Fond satellite" />
        <span>Satellite</span>
      </button>

      <hr class="fr-mt-3w fr-pb-2w" />

      <h6 class="fr-mb-2w fr-text--md">Calques</h6>
      <button aria-label="Calque classification" class="menu-entry" :class="{ 'active': classification }" @click="$emit('update:classification', !classification)">
        <img src="@/assets/map/classification.jpg" alt="" />
        <span>
          Classification
          <small class="fr-hint-text">Voir la <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte" @click.stop target="_blank">méthode de classification</a></small>
        </span>
      </button>
      <button aria-label="Calque numéros de cadastre" class="menu-entry" :class="{ 'active': cadastre }" @click="$emit('update:cadastre', !cadastre)">
        <img src="@/assets/map/cadastre.jpg" alt="" />
        <span>Numéros de cadastre</span>
      </button>
      <button aria-label="Calque " class="menu-entry" :class="{ 'active': ilots }" @click="$emit('update:ilots', !ilots)">
        <img src="../../assets/map/ilots.png" alt="" />
        <span>Numéros d'îlots (PAC)</span>
      </button>
    </div>
  </div>
</Teleport>
</template>

<style scoped>

.container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: end;
  margin: 1rem;
}

.menu-toggle {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.3125rem;
  border: 2px solid var(--text-inverted-grey);
  box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);

  &:hover {
    outline: 2px solid var(--text-inverted-grey);
  }

  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  span {
    color: var(--text-inverted-grey);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
  }

  span::before {
    mask-image: url(@/assets/map/icon-layers.svg);
  }
}

.menu-toggle--satellite {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.00) 21.88%, #000 89.58%), url(@/assets/map/plan.jpg) center / cover, lightgray 50% / contain no-repeat;
}

.menu-toggle--plan {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.00) 21.88%, #000 89.58%), url(@/assets/map/satellite.jpg) center / cover, lightgray 50% / contain no-repeat;
}

.menu {
  border-radius: 0.3125rem;
  background: #FFF;
  padding: 1.5rem;
  /* shadow / light / lifted */
  box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.menu-entry {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;

  > span {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
  }
}

.menu .menu-entry:hover {
  background-color: #fff;

  img {
    outline: 4px solid var(--border-active-blue-france);
  }
}

.menu-entry img {
  width: 3.375rem;
  height: 3.375rem;
  border-radius: 0.3125rem;
}

.menu-entry.active img {
  outline: 2px solid var(--border-active-blue-france);
}

.menu-entry.active span {
  color: var(--text-action-high-blue-france);
  font-weight: 700;
}
</style>
