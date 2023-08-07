<template>
  <section>
    <h5 class="fr-h5">
      Nouvelle parcelle
    </h5>

    <form @submit.prevent="">
      <p class="fr-h6">
        Localisation de la parcelle
      </p>

      <div class="fr-input-group">
        <label
          for="form-commune"
          class="fr-label"
        >Commune</label>

        <div class="fr-input-wrap fr-icon-road-map-fill">
          <CommuneSelect v-model="commune" />
        </div>
      </div>

      <p class="fr-h6">
        Limites de la parcelle
      </p>

      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input
            type="radio"
            id="radio-source-cadastre"
            name="source"
            value="cadastre"
            v-model="flowSource"
          >
          <label
            class="fr-label"
            for="radio-source-cadastre"
          >
            Par référence cadastrale
          </label>
        </div>

        <CadastreField
          v-for="(reference, index) in cadastreReferences"
          :key="index"
          :reference="reference"
          :commune="commune"
          :help-text="cadastreHelp[index]"
          @feature="updateReference(index, $event)"
        />
      </article>

      <article class="fr-pl-5w fr-mb-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input
            type="radio"
            id="radio-source-telepac"
            name="source"
            value="telepac"
            disabled
            v-model="flowSource"
          >
          <label
            class="fr-label"
            for="radio-source-telepac"
          >
            Par référence Telepac (<i>prochainement</i>)
          </label>
        </div>
      </article>

      <div class="fr-input-group fr-mt-5w">
        <button
          class="fr-btn"
          type="submit"
          :disabled="!canReachDetailsStep"
          @click="showDetailsModal = true"
        >
          Suivant
        </button>
      </div>
    </form>
  </section>

  <Teleport to="body">
    <Modal
      v-if="showDetailsModal"
      v-model="showDetailsModal"
      icon="fr-icon-file-text-fill"
    >
      <template #title>
        Ajouter une parcelle
      </template>
      <EditForm
        :feature="feature"
        @submit="saveFeature"
      />
    </Modal>
  </Teleport>
</template>

<script setup>
import { computed, markRaw, reactive, ref, toRaw } from 'vue'
import CadastreField from '@/components/Forms/CadastreField.vue';
import EditForm from '@/components/Features/SingleItemCertificationBodyForm.vue'
import Modal from "@/components/Modal.vue";
import { submitNewParcelle } from '@/cartobio-api';
import { featureCollection } from '@turf/helpers'
import { diff } from '../index.js'
import CommuneSelect from "@/components/Forms/CommuneSelect.vue";
import { useRouter } from "vue-router";
import { useFeaturesStore } from "@/stores/index.js"
import { usePermissions } from "@/stores/permissions.js"

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  },
  collection: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const flowSource = ref('cadastre')
const showDetailsModal = ref(false)
const commune = ref('')
const cadastreReferences = reactive([''])
const cadastreHelp = reactive([{message: '', error: false}])
const feature = reactive({
  type: "Feature",
  geometry: null,
  properties: {
    cultures: [{ CPF: '' }]
  }
})

const canReachDetailsStep = computed(() => cadastreReferences.filter(d => d).length > 0)
const router = useRouter()

function updateReference (index, { reference, feature: cadastreFeature }) {
  if (cadastreFeature === null) {
    cadastreReferences[index] = ''
    cadastreHelp[index] = {
      message: '',
      error: false
    }

    return
  }

  // 1. filter incoming geometry with known geometries
  const filteredFeature = diff(
    toRaw(cadastreFeature),
    featureCollection(props.collection.features.map(f => toRaw(f)))
  )

  if (filteredFeature === null) {
    cadastreReferences[index] = ''
    cadastreHelp[index] = {
      message: 'La parcelle est déjà incluse dans les autres parcelles.',
      error: true
    }
    return
  }

  if (filteredFeature.geometry.type === 'MultiPolygon') {
    cadastreHelp[index] = {
      message: 'La parcelle résultante est disjointe.',
      error: false
    }
  } else {
    cadastreHelp[index] = {
      message: '',
      error: false
    }
  }

  // 2. track changes
  cadastreReferences[index] = reference
  feature.geometry = filteredFeature.geometry
  feature.properties.cadastre = reference
  feature.properties.name = reference

  // 3. propage changes to listening component (eg: to display on map)
  emit('update', markRaw(featureCollection([toRaw(feature)])))
}

const featuresStore = useFeaturesStore()
const permissions = usePermissions()

async function saveFeature ({ patch }) {
  feature.properties = { ...feature.properties, ...patch }
  const record = await submitNewParcelle({ operatorId: props.operator.id }, feature)

  featuresStore.setAll(record.parcelles.features)

  showDetailsModal.value = false
  const route = permissions.isOc ? {
    name: 'certification-exploitations-id',
    params: { id: props.operator.id },
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
