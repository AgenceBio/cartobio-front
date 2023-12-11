<template>
  <section>
    <h5 class="fr-h5">Ajouter une parcelle</h5>

    <form @submit.prevent="">
      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input type="radio" id="radio-source-cadastre" name="source" value="cadastre" v-model="flowSource">
          <label class="fr-label" for="radio-source-cadastre">
            Par référence cadastrale
          </label>
        </div>


        <div class="fr-mb-10v" v-for="({ commune, key }, index) in cadastreParcelles" :key="key">
          <div class="fr-input-group fr-mb-3v">
            <label for="form-commune" class="fr-label">Commune</label>
            <CommuneSelect v-model="cadastreParcelles[index].commune" />
          </div>

          <div class="fr-input-group">
            <label class="fr-label">
              Reference cadastrale
            </label>
            <CadastreField :commune="flowSource === 'cadastre' ? commune : ''"
                           :form-error="cadastreParcelles[index].error"
                           :can-delete="cadastreParcelles.length > 1"
                           :field-id="key"
                           @feature="updateReference(index, $event)"
                           @delete="cadastreParcelles.splice(index, 1)"
            />
            <span v-if="cadastreParcelles[index].feature" class="fr-hint-text fr-message--valid">
              Parcelle cadastrale sélectionnée ({{ inHa(surface(cadastreParcelles[index].feature)) }} ha)
            </span>
          </div>
        </div>
        <span v-if="multipolygon" class="fr-hint-text fr-message--error fr-mb-3v">
          Les références cadastrales renseignées sont disjointes. Afin de pouvoir ajouter cette parcelle, les références cadastrales doivent se toucher.
        </span>

        <div v-if="canAddReference" class="fr-input-group">
          <button class="fr-btn fr-btn--secondary fr-btn--sm" type="button" @click="addReference">Ajouter une référence</button>
        </div>
      </article>

      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input type="radio" id="radio-source-dessin" name="source" value="dessin" v-model="flowSource">
          <label class="fr-label" for="radio-source-dessin">
            Par dessin sur la carte
          </label>
        </div>
      </article>

      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input type="radio" id="radio-source-telepac" name="source" value="telepac" disabled v-model="flowSource">
          <label class="fr-label" for="radio-source-telepac">
            Par référence Telepac (prochainement)
          </label>
        </div>
      </article>

      <div class="fr-input-group fr-mt-5w">
        <button class="fr-btn" type="submit" :disabled="flowSource === 'cadastre' && !feature || multipolygon" @click="nextButton">
          Continuer
        </button>
      </div>
    </form>
  </section>

  <Teleport to="body">
    <Component :is="editForm" v-if="showDetailsModal" :feature="feature" @submit="saveFeature" @close="showDetailsModal = false" icon="fr-icon-file-text-fill" data-content-name="Modale de confirmation d'ajout">
      <template #title>Ajouter une parcelle</template>
    </Component>
  </Teleport>
</template>

<script setup>
import { computed, markRaw, reactive, ref, toRaw, watch } from 'vue'
import CadastreField from '@/components/Forms/CadastreField.vue'
import { submitNewParcelle } from '@/cartobio-api.js';
import { featureCollection } from '@turf/helpers'
import { diff, featureName, inHa, merge, surface } from './index.js'
import CommuneSelect from "@/components/Forms/CommuneSelect.vue";
import { useRouter } from "vue-router";
import { useFeaturesStore, useRecordStore } from "@/stores/index.js"
import { usePermissions } from "@/stores/permissions.js"
import CertificationBodyEditForm from "@/components/Features/SingleItemCertificationBodyForm.vue"
import OperatorEditForm from "@/components/Features/SingleItemOperatorForm.vue"
import { statsPush } from "@/stats.js"
import toast from "@/components/toast.js"

const props = defineProps({
  backLink: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update'])
const router = useRouter()

const featuresStore = useFeaturesStore()
const recordStore = useRecordStore()
const permissions = usePermissions()

// Flow state
const flowSource = ref('cadastre')
const showDetailsModal = ref(false)
const editForm = computed(() => markRaw(permissions.isOc ? CertificationBodyEditForm : OperatorEditForm))

// Cadastre references
const cadastreParcelles = reactive([{ commune: '', reference: '', feature: null, error: '', key: crypto.randomUUID() }])
const feature = ref(null)
const canAddReference = computed(() => cadastreParcelles.length > 0 && cadastreParcelles.every(p => p.feature !== null))
const multipolygon = ref(false)

function addReference () {
  cadastreParcelles.push({ commune: '', reference: '', feature: null, error: '', key: crypto.randomUUID() })
}

function updateReference (index, { reference, feature: cadastreFeature }) {
  if (cadastreFeature === null) {
    cadastreParcelles[index].reference = ''
    cadastreParcelles[index].feature = null
    return;
  }

  // 1. filter incoming geometry with known geometries
  const filteredFeature = diff(
      toRaw(cadastreFeature),
      featureCollection(featuresStore.collection.features.map(f => toRaw(f)))
  )

  if (filteredFeature === null) {
    cadastreParcelles[index].reference = ''
    cadastreParcelles[index].feature = null
    cadastreParcelles[index].error = 'La parcelle est déjà incluse dans les autres parcelles.'

    return
  }

  // 2. track changes
  cadastreParcelles[index].reference = reference
  cadastreParcelles[index].feature = filteredFeature
  cadastreParcelles[index].error = ''
}

// Merge all cadastre references into a single feature
watch(cadastreParcelles, () => {

  const features = cadastreParcelles.map(p => p.feature).filter(feature => feature !== null)
  const references = cadastreParcelles.filter(p => p.feature !== null).map(p => p.reference)

  // if no cadastre references, reset feature
  if (features.length === 0) {
    multipolygon.value = false
    feature.value = null
    return
  }

  // if only one feature, use it as is
  if (features.length === 1) {
    multipolygon.value = features[0].geometry.type === 'MultiPolygon' && features[0].geometry.coordinates.length > 1;
    feature.value = {
      ...features[0],
      id: 1, // it will be replaced server-side, but we want to go through API Schema validation
      properties: {
        cadastre: [references[0]],
        cultures: [{ CPF: '', id: crypto.randomUUID() }]
      }
    }

    return
  }

  // merge features into one otherwise
  const combinedFeature = merge(toRaw(features))

  // check if resulting feature is a multipolygon
  // we still set features ref even if multipolygon to allow the user to view it
  multipolygon.value = combinedFeature.geometry.type === 'MultiPolygon' && combinedFeature.geometry.coordinates.length > 1;

  combinedFeature.id = 1 // it will be replaced server-side, but we want to go through API Schema validation
  combinedFeature.properties.cadastre = references
  combinedFeature.properties.cultures = [{ CPF: '', id: crypto.randomUUID() }]

  feature.value = combinedFeature
})

watch(feature, () => {
  if (feature.value === null) return

  emit('update', markRaw(featureCollection([toRaw(feature.value)])))
})

function nextButton() {
  if (flowSource.value === 'cadastre') {
    return showDetailsModal.value = true
  }

  if (flowSource.value === 'dessin') {
    return router.push({ name: 'exploitations-numeroBio-ajout-parcelle-dessin', params: { numeroBio: recordStore.record.operator.numeroBio || 1 }})
  }
}

async function saveFeature ({ properties }) {
  feature.value.properties = { ...feature.value.properties, ...properties }
  const record = await submitNewParcelle({ recordId: recordStore.record.record_id }, feature.value)
  const newId = record.parcelles.features.at(-1).id
  featuresStore.setAll(record.parcelles.features)

  showDetailsModal.value = false
  statsPush(['trackEvent', 'Parcelles', 'Ajout par cadastre (sauvegarde)'])

  await router.push(props.backLink)

  toast.success(`Parcelle « ${featureName(feature.value)} » ajoutée.`, 'Voir la parcelle', () => {
    featuresStore.select(newId)
  })
}
</script>

<style scoped>
label[for="form-commune"] + div {
  max-width: 25em;
}
</style>
