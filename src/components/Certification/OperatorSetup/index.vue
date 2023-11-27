<template>
  <p class="fr-text--lead">Importer un parcellaire d'exploitation agricole.</p>

  <div class="actions">
    <div class="fr-card fr-card--horizontal fr-mb-3w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            L'agriculteur utilise CartoBio
          </h3>
          <p class="fr-card__desc">
            L'agriculteur <b>{{ operator.nom }}</b> est autonome sur CartoBio.
            Cette personne peut récupérer des données depuis son logiciel de gestion
            (Geofolia, MesParcelles…) ou à partir de sa déclaration Telepac la plus récente.
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

    <div class="fr-card fr-card--horizontal fr-mb-3w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            Données PAC de {{ télépac.campagne }}
          </h3>
          <div class="fr-card__desc">
            <p>
              Importez vous-même le fichier .zip de la <b>déclaration PAC de {{ télépac.campagne }}</b>.
              Ce fichier peut vous être fourni par l'agriculteur ou par sa structure de gestion.
            </p>
            <p>
              Vous aurez éventuellement à <b>mettre à jour</b> les parcelles ayant changé depuis
              cette déclaration.
            </p>
          </div>
        </div>
        <div class="fr-card__footer">
          <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
            <li>
              <button class="fr-btn" @click.prevent="setupFromTelepacModal = true">
                démarrer l'import
              </button>
            </li>
            <li>
              <a class="fr-btn fr-btn--tertiary" href="https://docs-cartobio.agencebio.org/organisme-certification/pas-a-pas/ajout-des-donnees-dun-parcellaire#1-import-de-la-declaration-pac" target="_blank">
                besoin d'aide&nbsp;?
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="fr-card fr-card--horizontal">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            Données PAC de {{ télépac.preloadedCampagne }}
          </h3>
          <div class="fr-card__desc">
            <p>
              Importez <b>en un clic</b> la déclaration PAC de {{ télépac.preloadedCampagne }}.
            </p>
            <p>
              Vous aurez ensuite à <b>mettre à jour</b> les parcelles ayant changé depuis la déclaration de {{ télépac.preloadedCampagne }}.
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
        <div class="fr-card__footer">
          <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
            <li>
              <button class="fr-btn" @click.prevent="setupFromRPGModal = true">
                démarrer l'import
              </button>
            </li>
            <li>
              <a class="fr-btn fr-btn--tertiary" href="https://docs-cartobio.agencebio.org/organisme-certification/pas-a-pas/ajout-des-donnees-dun-parcellaire#2-import-par-numero-de-pac" target="_blank">
                besoin d'aide&nbsp;?
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <telepacModal :operator="operator" @upload="handleUpload" @close="setupFromTelepacModal = false" v-if="setupFromTelepacModal" />
  </Teleport>

  <Teleport to="body">
    <RPGModal :operator="operator" @upload="handleUpload" @close="setupFromRPGModal = false" v-if="setupFromRPGModal" />
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

import telepacModal from '@/components/Certification/OperatorSetup/TelepacModal.vue'
import RPGModal from '@/components/Certification/OperatorSetup/RPGModal.vue'

import { useTélépac } from '@/referentiels/pac.js'
import { useRecordStore } from '@/stores/index.js'
import { createOperatorRecord } from '@/cartobio-api.js'
import { now } from '@/components/dates.js'

const recordStore = useRecordStore()
const télépac = useTélépac()

const props = defineProps({
  operator: {
    type: Object,
    required: true
  }
})

const setupFromTelepacModal = ref(false)
const setupFromRPGModal = ref(false)

async function handleUpload ({ geojson, source, metadata = {} }) {
  const { id: operatorId, numeroBio, organismeCertificateur } = props.operator
  const { id: ocId, nom: ocLabel } = organismeCertificateur

  const record = await createOperatorRecord(operatorId, {
    numeroBio,
    ocId,
    ocLabel,
    geojson,
    metadata: {
      ...metadata,
      source,
      sourceLastUpdate: now()
    }
  })

  recordStore.update(record)

  setupFromTelepacModal.value = false
  setupFromRPGModal.value = false
}
</script>
