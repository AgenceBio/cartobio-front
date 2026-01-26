<template>
  <Modal @close="emit('close')" v-bind="$attrs">
    <template #title> <slot name="title" /> </template>
    <form @submit.prevent="validate" id="feature-edit-cutlures-form">
      <CultureSelector
        v-if="permissions.canChangeCulture"
        :feature-id="feature.properties.id"
        :cultures="patch.cultures"
        @change="($cultures) => (patch.cultures = $cultures)"
      />
    </form>
    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
        <li>
          <button
            class="fr-btn"
            type="submit"
            form="feature-edit-cutlures-form"
            aria-label="Enregister le niveau de conversion"
            @click="validate()"
          >
            Enregistrer
          </button>
        </li>
        <li>
          <button
            class="fr-btn fr-btn--tertiary"
            @click="emit('close')"
            aria-label="Annuler la modification du niveau de conversion"
          >
            Annuler
          </button>
        </li>
      </ul>
      <div class="fr-input-group"></div>
    </template>
  </Modal>
</template>

<script setup>
import { reactive, onBeforeUnmount, watch } from "vue";
import Modal from "@/components/widgets/Modal.vue";
import { usePermissions } from "@/stores/permissions";
import { useFeaturesSetsStore } from "@/stores/features-sets";
import CultureSelector from "./fields/CultureSelector.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "close"]);

const patch = reactive({
  cultures: props.feature.properties.cultures,
});
const permissions = usePermissions();
const featuresSet = useFeaturesSetsStore();

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    featuresSet.setCandidate([
      {
        id: props.feature.id,
        geometry: props.feature.geometry,
        properties: {
          ...props.feature.properties,
          ...properties,
        },
      },
    ]);
  },
  { immediate: props.feature.properties.isCertified ?? false },
);

const validate = () => {
  const set = featuresSet.byFeature(props.feature.id, true);
  if (set.has("culture-unsure")) {
    return false;
  }
  emit("submit", { id: props.feature.id, properties: patch });
};
</script>

<style scoped></style>
