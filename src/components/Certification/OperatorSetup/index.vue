<template>
  <p class="fr-text--lead">Importer un parcellaire d'exploitation agricole.</p>

  <div class="actions">
    <div class="fr-card fr-card--horizontal fr-mb-3w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            Import du parcellaire par l'agriculteur
          </h3>
          <p class="fr-card__desc">
            L'agriculteur <b>{{ operator.nom }}</b> est autonome sur CartoBio.
            Il peut importer des données depuis son logiciel de gestion
            (Géofolia, MesParcelles…) ou ses données PAC.
          </p>
          <div class="fr-card__start">
            <ul class="fr-tags-group">
              <li>
                <p class="fr-badge fr-badge--info fr-badge--no-icon">recommandé</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-card fr-enlarge-link fr-card--horizontal fr-mb-3w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            <a href="#" role="button" @click.prevent="setupFromTelepacModal = true">
              Import des données PAC de 2022
            </a>
          </h3>
          <div class="fr-card__desc">
            <p>
              Importez vous-même le fichier .zip de la <b>déclaration PAC de 2022</b>.
              Ce fichier peut vous être fourni par l'agriculteur ou sa structure de gestion.
            </p>
            <p>
              Vous aurez ensuite à <b>mettre à jour</b> les parcelles ayant changé depuis
              la déclaration de 2022.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="fr-card fr-enlarge-link fr-card--horizontal">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            <a href="#" role="button" @click.prevent="setupFromRPGModal = true">
              Import des données PAC de 2021
            </a>
          </h3>
          <div class="fr-card__desc">
            <p>
              Importez <b>en un clic</b> la déclaration PAC de 2021.
            </p>
            <p>
              Vous aurez ensuite à <b>mettre à jour</b> les parcelles ayant changé depuis la déclaration de 2021.
            </p>
          </div>
          <div class="fr-card__start">
            <ul class="fr-tags-group">
              <li>
                <p class="fr-badge fr-badge--success fr-badge--no-icon">en un clic</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->
  </div>

  <Teleport to="body">
    <telepacModal :operator="operator" @upload="handleUpload" v-model="setupFromTelepacModal" v-if="setupFromTelepacModal" />
  </Teleport>

  <Teleport to="body">
    <RPGModal :operator="operator" v-model="setupFromRPGModal" v-if="setupFromRPGModal" />
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

import telepacModal from '@/components/Certification/OperatorSetup/TelepacModal.vue'
import RPGModal from '@/components/Certification/OperatorSetup/RPGModal.vue'

import { useFeaturesStore, useRecordStore } from '@/stores/index.js'
import { submitParcellesChanges } from '@/cartobio-api.js'
import { now } from '@/components/dates.js'

const featureStore = useFeaturesStore()
const recordStore = useRecordStore()

const props = defineProps({
  operator: {
    type: Object,
    required: true
  }
})

const setupFromTelepacModal = ref(false)
const setupFromRPGModal = ref(false)

async function handleUpload ({ geojson, source }) {
  const { id: operatorId, numeroBio, organismeCertificateur } = props.operator
  const { id: ocId, nom: ocLabel } = organismeCertificateur

  const record = await submitParcellesChanges({
    operatorId,
    numeroBio,
    ocId,
    ocLabel,
    geojson,
    metadata: {
      source,
      sourceLastUpdate: now()
    }
  })

  recordStore.update(record)
  featureStore.setAll(record.parcelles.features)

  setupFromTelepacModal.value = false
  setupFromRPGModal.value = false
}
</script>
