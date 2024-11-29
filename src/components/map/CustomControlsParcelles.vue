<script setup>
import { useWindowWidth } from "@/composables/useWindowWidth";
import { ref } from "vue";

const emit = defineEmits(["editContour", "divide", "cutBorders", "mesure", "delete", "undo", "redo"]);
const props = defineProps({
  mode: {
    type: String,
    required: true,
    default: "modif",
  },
  canUndo: {
    type: Boolean,
    required: true,
  },
  canRedo: {
    type: Boolean,
    required: true,
  },
  canDelete: {
    type: Boolean,
    required: true,
  },
  mesureActive: {
    type: Boolean,
    required: true,
  },
});
const currentMode = ref(props.mode);
const windowWidth = useWindowWidth();

const selectModif = () => {
  emit("editContour");
  currentMode.value = "modif";
};

const selectDivid = () => {
  emit("divide");
  currentMode.value = "divid";
};

const selectCutBorders = () => {
  emit("cutBorders");
  currentMode.value = "cutBorder";
};

const selectMesure = () => {
  emit("mesure");
};

const supprimer = () => {
  emit("delete");
};

const undo = () => {
  emit("undo");
};

const redo = () => {
  emit("redo");
};
</script>

<template>
  <Teleport to=".maplibregl-ctrl-top-left">
    <div class="command-modif-parcellaire maplibregl-ctrl">
      <div class="left-buttons">
        <button
          :class="currentMode === 'modif' ? 'selected-button' : ''"
          type="button"
          title="Modifier"
          aria-label="Modifier"
          @click="selectModif()"
        >
          <span class="ri-shape-line" aria-hidden="true" style="font-size: 1.5em"></span>
          <span v-if="windowWidth > 780" class="button-text">Modifier</span>
        </button>

        <div class="separator"></div>

        <button
          :class="currentMode == 'divid' ? 'selected-button' : ''"
          type="button"
          title="Diviser"
          aria-label="Diviser"
          @click="selectDivid()"
        >
          <span class="ri-scissors-cut-fill" aria-hidden="true" style="font-size: 1.5em"></span>
          <span v-if="windowWidth > 780" class="button-text">Diviser</span>
        </button>

        <div class="separator"></div>

        <button
          type="button"
          :class="currentMode === 'cutBorder' ? 'selected-button' : ''"
          title="Découper les bordures"
          aria-label="Découper les bordures"
          @click="selectCutBorders()"
        >
          <span class="fr-icon-crop-line" aria-hidden="true"></span>
          <span v-if="windowWidth > 780" class="button-text">{{
            windowWidth > 1280 ? "Découper les bordures" : "Bordure"
          }}</span>
        </button>
        <div class="separator"></div>
      </div>

      <div class="right-buttons">
        <button
          type="button"
          title="Mesurer"
          :class="mesureActive ? 'selected-button' : ''"
          @click="selectMesure()"
          aria-label="Mesurer"
        >
          <span class="ri-ruler-fill" aria-hidden="true" style="font-size: 1.5em"></span>
        </button>
        <div class="separator"></div>
        <button type="button" title="Supprimer" aria-label="Supprimer" :disabled="!canDelete" @click="supprimer()">
          <span class="fr-icon-delete-fill" aria-hidden="true"></span>
        </button>
        <button type="button" title="Annuler" aria-label="Annuler" :disabled="!canUndo" @click="undo()">
          <span class="fr-icon-arrow-go-back-fill" aria-hidden="true"></span>
        </button>
        <button type="button" title="Rétablir" aria-label="Rétablir" :disabled="!canRedo" @click="redo()">
          <span class="fr-icon-arrow-go-forward-fill" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style>
.command-modif-parcellaire {
  display: inline-flex;
  justify-content: space-between;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
}

.right-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: #ddd;
  margin: 0 4px;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #000091;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.right-buttons button {
  padding: 8px;
}

button:hover {
  background-color: #f5f5f5;
}

.button-text {
  margin-left: 4px;
  color: #000091;
}

@media (min-width: 780px) {
  .maplibregl-ctrl-top-left {
    margin-left: 15% !important;
    margin-top: 20px !important;
    z-index: 1000 !important;
  }
}

.selected-button {
  background-color: #ececfe !important;
}

.maplibregl-ctrl {
  margin: 0px !important;
}
</style>
