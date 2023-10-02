<template>
  <div class="fr-input-group">
    <label class="fr-label">Informations sur la parcelle (facultatif)</label>
    <div class="fr-hint-text">
      Cette information n'est pas visible pour l'agriculteur.
    </div>

    <ul class="fr-tags-group">
      <li v-for="(annotation, annotationId) in visibleAnnotations" :key="annotationId">
        <button class="fr-tag" type="button" :aria-pressed="isSelected(annotationId)" @click="toggleAnnotation(annotationId)">{{ annotation.label }}</button>
      </li>
      <li class="more" :hidden="isExpanded">
        <button class="fr-tag fr-tag--beige-gris-galet fr-tag--icon-left fr-icon-add-line" type="button" @click="isExpanded=true">Afficher plus</button>
      </li>
    </ul>
  </div>

  <div class="fr-input-group" v-if="isSelected(ANNOTATIONS.REDUCED_CONVERSION_PERIOD)">
    <label class="fr-label" for="reduced_conversion_period_state">Information sur la dérogation</label>

    <select class="fr-select" name="reduced_conversion_period_state" id="reduced_conversion_period_state" :value="getMetadata(ANNOTATIONS.REDUCED_CONVERSION_PERIOD, ANNOTATIONS.METADATA_STATE)" @change="updateMetadata(ANNOTATIONS.REDUCED_CONVERSION_PERIOD, ANNOTATIONS.METADATA_STATE, $event.target.value)">
      <option value="">Sélectionner le statut</option>
      <option :value="key" :key="key" v-for="({ label }, key) in reducedConversionStates">
        {{ label }}
      </option>
    </select>
  </div>

  <div class="fr-input-group" v-if="isSelected(ANNOTATIONS.DOWNGRADED)">
    <label class="fr-label" for="downgraded_state">Information sur le déclassement</label>

    <select class="fr-select" name="downgraded_state" id="downgraded_state" :value="getMetadata(ANNOTATIONS.DOWNGRADED, ANNOTATIONS.METADATA_STATE)" @change="updateMetadata(ANNOTATIONS.DOWNGRADED, ANNOTATIONS.METADATA_STATE, $event.target.value)">
      <option value="">Sélectionner le statut</option>
      <option :value="key" :key="key" v-for="({ label }, key) in downgradedStates">
        {{ label }}
      </option>
    </select>
  </div>

  <div class="fr-alert fr-alert--info fr-my-2w" v-if="isSelected(ANNOTATIONS.DOWNGRADED)">
    <p>
      Voici l'identifiant de parcelle à renseigner dans l'API&nbsp;Certification
      de l'Agence Bio : <code>{{ featureId }}</code>.
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ANNOTATIONS, AnnotationTags } from '@/referentiels/ab.js'
import { now } from '@/components/dates.js'

/**
 * @typedef {import('@/referentiels/ab.js').UserAnnotation} UserAnnotation
 */

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  featureId: {
    type: [String, Number],
    required: true,
  },
  modelValue: {
    type: Array,
    required: true,
    default: () => ([])
  }
})

const isExpanded = ref(false)
const visibleAnnotations = computed(() => Object.fromEntries(
  Object.entries(AnnotationTags).filter(([key, { featured }]) => isExpanded.value || featured)
))

const reducedConversionStates = computed(() => AnnotationTags[ANNOTATIONS.REDUCED_CONVERSION_PERIOD].metadata[ANNOTATIONS.METADATA_STATE])
const downgradedStates = computed(() => AnnotationTags[ANNOTATIONS.DOWNGRADED].metadata[ANNOTATIONS.METADATA_STATE])

function isSelected (annotationId) {
  return Boolean(getAnnotation(annotationId))
}

function toggleAnnotation (annotationId) {
  const isFound = isSelected(annotationId)

  emit('update:modelValue', isFound
    ? props.modelValue.filter(({ code }) => code !== annotationId)
    : [...props.modelValue, /** @type {UserAnnotation} */({
      id: crypto.randomUUID(),
      code: annotationId,
      date: now()
    })]
  )
}
function getAnnotation (annotationId) {
  return props.modelValue.find(({ code }) => code === annotationId)
}

function getMetadata (annotationId, metadataId) {
  return (getAnnotation(annotationId)?.metadata ?? {})[metadataId] ?? ''
}

function updateMetadata (annotationId, metadataId, value) {
  const updatedMetadata = props.modelValue.map((annotation) => {
    if (annotation.code !== annotationId) {
      return annotation
    }

    return {
      ...annotation,
      metadata: {
      ...annotation.metadata ?? {},
      [metadataId]: value
      }
    }
  })

  emit('update:modelValue', updatedMetadata)
}
</script>