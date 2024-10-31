<script setup>
import { ref } from "vue";

const emit = defineEmits(["editContour", "divide", "cutBorders"]);
const props = defineProps({
  mode: {
    type: String,
    required: true,
    default: "modif",
  },
});
const currentMode = ref(props.mode);

const selectModif = () => {
  emit("editContour");
  currentMode.value = "modif";
};

const selectDivid = () => {
  emit("divide");
  console.log("test");
  currentMode.value = "divid";
  console.log(currentMode.value);
};

const selectCutBorders = () => {
  emit("cutBorders");
  currentMode.value = "cutBorder";
};
</script>

<template>
  <Teleport to=".maplibregl-ctrl-top-left">
    <div class="command-modif-parcellaire maplibregl-ctrl">
      <div class="left-buttons">
        <button
          :class="currentMode.value === 'modif' ? 'selected-button' : ''"
          type="button"
          title="Modifier"
          aria-label="Modifier"
          @click="selectModif()"
        >
          <span class="fr-icon-edit-fill" aria-hidden="true"></span>
          <span class="button-text">Modifier</span>
        </button>

        <div class="separator"></div>

        <button
          :class="currentMode.value == 'divid' ? 'selected-button' : ''"
          type="button"
          title="Diviser"
          aria-label="Diviser"
          @click="selectDivid()"
        >
          <span class="fr-icon-bug-fill" aria-hidden="true"></span>
          <span class="button-text">Diviser</span>
        </button>

        <div class="separator"></div>

        <button
          type="button"
          :class="currentMode.value === 'cutBorder' ? 'selected-button' : ''"
          title="Découper les bordures"
          aria-label="Découper les bordures"
          @click="selectCutBorders()"
        >
          <span class="fr-icon-bug-fill" aria-hidden="true"></span>
          <span class="button-text">Découper les bordures</span>
        </button>
        <div class="separator"></div>
      </div>

      <div class="right-buttons">
        <button type="button" title="Mesurer" aria-label="Annuler">
          <span class="fr-icon-bug-fill" aria-hidden="true"></span>
        </button>
        <div class="separator"></div>
        <button type="button" title="Annuler" aria-label="Annuler">
          <span class="fr-icon-bug-fill" aria-hidden="true"></span>
        </button>
        <button type="button" title="Rétablir" aria-label="Rétablir">
          <span class="fr-icon-bug-fill" aria-hidden="true"></span>
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
  border-radius: 4px;
  color: #666;
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

.maplibregl-ctrl-top-left {
  margin-left: 15% !important;
  margin-top: 20px !important;
  z-index: 1000 !important;
}

.selected-button {
  background-color: #ececfe !important;
}

.maplibregl-ctrl {
  margin: 0px !important;
}
</style>
