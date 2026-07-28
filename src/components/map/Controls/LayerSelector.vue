<template>
  <div class="container olgl-ctrl" ref="layersMenuRef">
    <button
      type="button"
      class="menu-toggle"
      :class="{
        'menu-toggle--satellite': fond === 'satellite',
        'menu-toggle--plan': fond === 'plan',
        'menu-toggle--mobile': isMobile,
      }"
      @click="showMenu = !showMenu"
      :aria-expanded="showMenu"
      aria-controls="layers-menu-dialog"
      :aria-label="isMobile ? 'Afficher le menu des calques' : 'Calques'"
    >
      <span v-if="!isMobile" class="fr-icon--sm fr-mb-1v" aria-hidden="true"> Calques </span>
      <span v-else class="fr-icon-layers-line" aria-hidden="true"></span>
    </button>

    <dialog
      aria-labelledby="map-layers-title"
      id="layers-menu-dialog"
      class="menu"
      :class="{ 'menu--mobile': isMobile }"
      :open="showMenu"
      @keydown.tab="handleTabKey"
    >
      <h2 id="map-layers-title" class="fr-h5 fr-mb-2w">Calques</h2>

      <button
        type="button"
        class="close-button fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-right fr-icon-close-line"
        @click="showMenu = false"
        aria-label="Fermer le menu des calques"
      >
        Fermer
      </button>

      <h3 class="fr-h6 fr-my-2w">Fonds de carte</h3>
      <div v-if="isMobile" class="menu-entries-mobile">
        <button
          type="button"
          class="menu-entry-mobile"
          :class="{ active: fond === 'plan' }"
          @click="$emit('update:fond', 'plan')"
          aria-label="Choisir le fond plan"
          :aria-pressed="fond === 'plan'"
        >
          <span class="fr-icon-map-2-line" aria-hidden="true"></span>
          <span>Plan</span>
        </button>
        <button
          type="button"
          class="menu-entry-mobile"
          :class="{ active: fond === 'satellite' }"
          @click="$emit('update:fond', 'satellite')"
          aria-label="Choisir le fond satellite"
          :aria-pressed="fond === 'satellite'"
        >
          <span class="fr-icon-earth-line" aria-hidden="true"></span>
          <span>Satellite</span>
        </button>
      </div>

      <div v-else>
        <button
          type="button"
          class="menu-entry"
          :class="{ active: fond === 'plan' }"
          @click="$emit('update:fond', 'plan')"
          aria-label="Choisir le fond plan"
          :aria-pressed="fond === 'plan'"
        >
          <img src="@/assets/map/plan.jpg" alt="Fond plan" />
          <span>Plan</span>
        </button>
        <button
          type="button"
          class="menu-entry"
          :class="{ active: fond === 'satellite' }"
          @click="$emit('update:fond', 'satellite')"
          aria-label="Choisir le fond satellite"
          :aria-pressed="fond === 'satellite'"
        >
          <img src="@/assets/map/satellite.jpg" alt="Fond satellite" />
          <span>Satellite</span>
        </button>
      </div>

      <hr class="fr-mt-3w fr-pb-2w" />

      <h3 class="fr-h6 fr-mb-2w">Calques</h3>

      <div v-if="isMobile" class="menu-entries-mobile">
        <button
          type="button"
          class="menu-entry-mobile"
          :class="{ active: classification }"
          @click="$emit('update:classification', !classification)"
          :aria-label="`${!classification ? 'Activer' : 'Désactiver'} le calque RPG ${currentCampagne}`"
          :aria-pressed="classification"
        >
          <span class="fr-icon-plant-line" aria-hidden="true"></span>
          <span> <abbr title="Registre Parcellaire Graphique">RPG</abbr> {{ currentCampagne }} </span>
        </button>
        <button
          type="button"
          class="menu-entry-mobile"
          :class="{ active: cadastre }"
          @click="$emit('update:cadastre', !cadastre)"
          :aria-label="`${!cadastre ? 'Activer' : 'Désactiver'} le calque références cadastrales`"
          :aria-pressed="cadastre"
        >
          <span class="fr-icon-building-line" aria-hidden="true"></span>
          <span>Cadastre</span>
        </button>
      </div>

      <div v-else>
        <button
          type="button"
          class="menu-entry"
          :class="{ active: classification }"
          @click="$emit('update:classification', !classification)"
          :aria-label="`${!classification ? 'Activer' : 'Désactiver'} le calque RPG ${currentCampagne}`"
          :aria-pressed="classification"
          :disabled="mapParams.blockPlan"
        >
          <img src="@/assets/map/classification.jpg" alt="Fond RPG" />
          <span>
            <p class="fr-mb-0"><abbr title="Registre Parcellaire Graphique">RPG</abbr> {{ currentCampagne }}</p>
            <small class="fr-hint-text"
              >Voir la
              <a
                href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte"
                @click.stop
                target="_blank"
                >méthode de classification<lien-externe /></a
            ></small>
          </span>
        </button>
        <button
          type="button"
          class="menu-entry"
          :class="{ active: cadastre }"
          @click="$emit('update:cadastre', !cadastre)"
          :aria-label="`${!cadastre ? 'Activer' : 'Désactiver'} le calque références cadastrales`"
          :aria-pressed="cadastre"
          :disabled="mapParams.blockPlan"
        >
          <img src="@/assets/map/cadastre.jpg" alt="Fond cadastre" />
          <span>Cadastre</span>
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { useTélépac } from "@/referentiels/pac.js";
import { usePreferences } from "@/stores/preferences.js";
import { storeToRefs } from "pinia";

/**
 * * Refs
 */

const showMenu = ref(false);
const layersMenuRef = ref(null);
const { preloadedCampagne: currentCampagne } = useTélépac();

/**
 * * Stores
 */
const preferences = usePreferences();

const { params: mapParams } = storeToRefs(preferences);

/**
 * * Props
 */

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
  isMobile: {
    type: Boolean,
    default: false,
  },
});

/**
 * * Emits
 */

defineEmits(["update:fond", "update:classification", "update:cadastre"]);

/**
 * * Fonctions
 */

const cancelKeyStroke = onKeyStroke("Escape", () => (showMenu.value = false));
const cancelClickOutside = onClickOutside(layersMenuRef, () => (showMenu.value = false));

function handleTabKey(event: KeyboardEvent) {
  const dialog = layersMenuRef.value?.querySelector("dialog");
  if (!dialog) return;

  const focusables = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.closest("[aria-hidden='true']"));

  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/**
 * * States fonctions
 */

onBeforeUnmount(() => {
  if (cancelClickOutside) {
    cancelClickOutside();
  }
  cancelKeyStroke();
});
</script>

<style scoped>
.container {
  position: absolute;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: flex-end;
  margin: 10px;
  z-index: 1;
  bottom: 0px;
}

.menu-toggle {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.3125rem;
  border: 4px solid var(--text-inverted-grey);
  box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);

  &:hover {
    outline: 2px solid var(--text-inverted-grey);
    outline-offset: 0;
  }

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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

.menu-toggle--mobile {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: white;
  justify-content: center;

  span {
    color: var(--text-default-grey);
    font-size: 1.25rem;
  }

  &:hover {
    outline: 2px solid var(--border-default-grey);
  }
}

.menu-toggle--satellite {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 21.88%, #000 89.58%),
    url(@/assets/map/plan.jpg) center / cover,
    lightgray 50% / contain no-repeat;
}

.menu-toggle--plan {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 21.88%, #000 89.58%),
    url(@/assets/map/satellite.jpg) center / cover,
    lightgray 50% / contain no-repeat;
}

.menu {
  border: none;
  border-radius: 5px;
  background: #fff;
  left: 7rem;
  padding: 1.5rem;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
  width: 22rem;
}

.menu--mobile {
  width: 16rem;
  left: 0rem;
  bottom: 3.5rem;
  padding: 1rem;
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

.menu-entries-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-entry-mobile {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-default-grey);
  background: white;
  text-align: left;

  &:hover {
    background-color: var(--background-alt-blue-france);
  }

  > span:first-child {
    font-size: 1.25rem;
    color: var(--text-default-grey);
  }
}

.menu-entry-mobile.active {
  background-color: var(--background-alt-blue-france);
  border-color: var(--border-active-blue-france);

  > span {
    color: var(--text-action-high-blue-france);
    font-weight: 700;
  }
}
</style>
