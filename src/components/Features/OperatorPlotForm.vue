<template>
  <form @submit.prevent="emit('submit', formState)">
    <div class="fr-input-group">
      <label class="fr-label">Type de culture</label>
      <select class="fr-select" v-model="formState.TYPE">
        <option v-if="!hasOneFeature" class="unchanged" :value="undefined">Inchangé</option>
        <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">{{ libellé }}</option>
      </select>
    </div>

    <div class="fr-input-group">
      <label class="fr-label">Niveau de conversion</label>
      <select class="fr-select" v-model="formState.conversion_niveau">
        <option v-if="!hasOneFeature" class="unchanged" :value="undefined">Inchangé</option>
        <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
      </select>
    </div>

    <div class="fr-input-group" v-if="isABLevel(formState.conversion_niveau)">
      <label class="fr-label">Date d'engagement</label>
      <div class="fr-input-wrap fr-icon-calendar-line">
        <input type="date" class="fr-input" v-model="formState.engagement_date" required />

        <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
        <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
      </div>
    </div>

    <div class="fr-input-group">
      <label class="fr-label">Commentaire</label>
      <textarea class="fr-input" rows="5" v-model="formState.commentaire" />
    </div>

    <ul class="fr-btns-group">
      <li>
        <button v-if="hasOneFeature" class="fr-btn">Appliquer les changements sur cette parcelle</button>
        <button v-else class="fr-btn">Appliquer les changements sur ces {{props.features.length}} parcelles</button>
      </li>
      <li>
        <button type="cancel" @click.prevent="emit('cancel')" class="fr-link">Annuler ces modifications</button>
      </li>
    </ul>
  </form>
</template>

<script setup>
import { liste as codesPac, groupLibelléFromCode } from '../../referentiels/pac.js'
import { conversionLevels, isABLevel } from '../../referentiels/ab.js'
import { unref, reactive, computed } from 'vue'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
  features: {
    type: Array,
    default: []
  }
})

const features = unref(props.features)
const hasOneFeature = computed(() => props.features.length === 1)

const formState = reactive({
  commentaire: hasOneFeature.value ? features[0].properties.commentaire : undefined,
  conversion_niveau: hasOneFeature.value ? features[0].properties.conversion_niveau : undefined,
  declaration_pac: hasOneFeature.value ? features[0].properties.declaration_pac : undefined,
  declaration_pac_bio: hasOneFeature.value ? features[0].properties.declaration_pac_bio : undefined,
  declaration_pac_type: hasOneFeature.value ? features[0].properties.declaration_pac_type : undefined,
  engagement_date: hasOneFeature ? features[0].properties.engagement_date : undefined,
  TYPE: hasOneFeature.value ? features[0].properties.TYPE : undefined,
})
</script>

<style scoped>
</style>
