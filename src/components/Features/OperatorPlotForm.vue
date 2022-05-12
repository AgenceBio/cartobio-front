<template>
  <form @submit.prevent="emit('submit', formState)">
    <div class="field">
      <label>Type de culture</label>
      <div class="control">
        <select v-model="formState.type">
          <option v-if="!hasOneFeature" class="unchanged" :value="undefined">Inchangé</option>
          <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">{{ libellé }}</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>Niveau de conversion</label>
      <div class="control">
        <select v-model="formState.conversion_niveau">
          <option v-if="!hasOneFeature" class="unchanged" :value="undefined">Inchangé</option>
          <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
        </select>
      </div>
    </div>

    <div class="field" v-if="isABLevel(formState.conversion_niveau)">
      <label>Date d'engagement</label>
      <div class="control">
        <input type="date" v-model="formState.engagement_date" required />

        <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
        <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
      </div>
    </div>

    <div class="field" v-if="formState.conversion_niveau">
      <label>Déclaration PAC</label>
      <div class="control">
        <input id="plot_declaration_pac" type="checkbox" v-model="formState.declaration_pac" :value="1" />
        <label for="plot_declaration_pac" v-if="hasOneFeature">cette parcelle bénéficie d'une aide PAC</label>
        <label for="plot_declaration_pac" v-else>ces {{ props.features.length }} parcelles bénéficient d'une aide PAC</label>
      </div>
    </div>

    <div class="field">
      <label>Commentaire</label>
      <div class="control"><textarea v-model="formState.commentaire" /></div>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button v-if="hasOneFeature" class="button is-link">Appliquer les changements sur cette parcelle</button>
        <button v-else class="button is-link">Appliquer les changements sur ces {{props.features.length}} parcelles</button>
      </div>
      <div class="control">
        <button type="cancel" @click.prevent="emit('cancel')" class="button link">Annuler les modifications</button>
      </div>
    </div>
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
  engagement_date: hasOneFeature ? features[0].properties.engagement_date : undefined,
  type: hasOneFeature.value ? features[0].properties.TYPE : undefined,
})
</script>

<style scoped>
@import '@/styles/form.css';
</style>
