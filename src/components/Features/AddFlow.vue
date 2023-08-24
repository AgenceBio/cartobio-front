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
            <CadastreField :commune="commune"
                           :form-error="cadastreParcelles[index].error"
                           :can-delete="cadastreParcelles.length > 1"
                           :field-id="key"
                           @feature="updateReference(index, $event)"
                           @delete="cadastreParcelles.splice(index, 1)"
            />
          </div>
        </div>
        <span v-if="multipolygon" class="fr-hint-text fr-message--error fr-mb-3v">La parcelle résultante est disjointe.</span>

        <div v-if="canAddReference" class="fr-input-group">
          <button class="fr-btn fr-btn--secondary fr-btn--sm" type="button" @click="addReference">Ajouter une référence</button>
        </div>
      </article>

      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input type="radio" id="radio-source-telepac" name="source" value="telepac" disabled v-model="flowSource">
          <label class="fr-label" for="radio-source-telepac">
            Par référence Telepac (<i>prochainement</i>)
          </label>
        </div>
      </article>

      <div class="fr-input-group fr-mt-5w">
        <button class="fr-btn" type="submit" :disabled="!feature || multipolygon" @click="showDetailsModal = true">Ajouter</button>
      </div>
    </form>
  </section>

  <Teleport to="body">
    <Modal v-if="showDetailsModal" v-model="showDetailsModal" icon="fr-icon-file-text-fill">
      <template #title>Ajouter une parcelle</template>
      <Component :is="editForm" :feature="feature" @submit="saveFeature"/>
    </Modal>
  </Teleport>
</template>

<script setup>
import { computed, markRaw, reactive, ref, toRaw, watch } from 'vue'
import CadastreField from '@/components/Forms/CadastreField.vue'
import Modal from "@/components/Modal.vue";
import { submitNewParcelle } from '@/cartobio-api.js';
import { featureCollection } from '@turf/helpers'
import { diff, merge } from './index.js'
import CommuneSelect from "@/components/Forms/CommuneSelect.vue";
import { useRouter } from "vue-router";
import { useFeaturesStore, useMessages, useRecordStore } from "@/stores/index.js"
import { usePermissions } from "@/stores/permissions.js"
import CertificationBodyEditForm from "@/components/Features/SingleItemCertificationBodyForm.vue"
import OperatorEditForm from "@/components/Features/SingleItemOperatorForm.vue"

const emit = defineEmits(['update'])
const router = useRouter()

const featuresStore = useFeaturesStore()
const recordStore = useRecordStore()
const permissions = usePermissions()
const messages = useMessages()

// Flow state
const flowSource = ref('cadastre')
const showDetailsModal = ref(false)
const editForm = computed(() => markRaw(permissions.isOc ? CertificationBodyEditForm : OperatorEditForm))

// Cadastre references
const cadastreParcelles = reactive([{ commune: '', reference: '', feature: null, error: '', key: crypto.randomUUID() }])
const feature = ref(null)
const canAddReference = computed(() => cadastreParcelles.every(p => p.feature !== null))
const multipolygon = ref(false)

function addReference () {
  cadastreParcelles.push({ commune: '', reference: '', feature: null, error: '', key: crypto.randomUUID() })
}

function updateReference (index, { reference, feature: cadastreFeature }) {
  if (cadastreFeature === null) return;

  cadastreParcelles[index].reference = ''
  cadastreParcelles[index].feature = null
  cadastreParcelles[index].error = ''

  // 1. filter incoming geometry with known geometries
  const filteredFeature = diff(
      toRaw(cadastreFeature),
      featureCollection(featuresStore.collection.features.map(f => toRaw(f)))
  )

  if (filteredFeature === null) {
    cadastreParcelles[index].error = 'La parcelle est déjà incluse dans les autres parcelles.'

    return
  }

  // 2. track changes
  cadastreParcelles[index].reference = reference
  cadastreParcelles[index].feature = filteredFeature
}

// Merge all cadastre references into a single feature
watch(cadastreParcelles, () => {
  multipolygon.value = false
  feature.value = null

  const features = cadastreParcelles.map(p => p.feature).filter(feature => feature !== null)

  // do nothing if no feature
  if (features.length === 0) return

  // update immediately if only one feature
  if (features.length === 1) {
    multipolygon.value = false
    feature.value = cadastreParcelles[0].feature
    feature.value.properties.cadastre = [cadastreParcelles[0].reference]
    feature.value.properties.cultures = [{ CPF: '', id: crypto.randomUUID() }]

    return
  }

  // merge features into one otherwise
  const combinedFeature = merge(toRaw(features))

  if (combinedFeature === null) return

  // check if resulting feature is a multipolygon
  // we still set features ref even if multipolygon to allow the user to view it
  multipolygon.value = combinedFeature.geometry.type === 'MultiPolygon' && combinedFeature.geometry.coordinates.length > 1;

  combinedFeature.properties.cadastre = cadastreParcelles.map(p => p.reference).filter(ref => ref !== '')
  combinedFeature.properties.cultures = [{ CPF: '', id: crypto.randomUUID() }]

  feature.value = combinedFeature
})

watch(feature, () => {
  if (feature.value === null) return

  emit('update', markRaw(featureCollection([toRaw(feature.value)])))
})

async function saveFeature ({ patch }) {
  feature.value.properties = { ...feature.value.properties, ...patch }
  const record = await submitNewParcelle({ operatorId: recordStore.record.operator.id }, feature.value)

  messages.addMessage({ type: 'success', text: 'Parcelle ajoutée.' })

  featuresStore.setAll(record.parcelles.features)

  showDetailsModal.value = false
  const route = permissions.isOc ? {
    name: 'certification-exploitations-id',
    params: { id: recordStore.record.operator.id },
  } : { name: 'exploitation-parcellaire' }
  await router.push({
    query: { new: record.audit_history.at(-1).parcelleId },
    ...route,
  })
}
</script>

<style scoped>
label[for="form-commune"] + div {
  max-width: 25em;
}
</style>
