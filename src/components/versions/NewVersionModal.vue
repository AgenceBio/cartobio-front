<script setup>

import Modal from "@/components/Modal.vue"
import { useOperatorStore } from "@/stores/operator.js"
import { useRecordStore } from "@/stores/record.js"
import { sources } from "@/referentiels/imports.js"
import { createOperatorRecord } from "@/cartobio-api.js"
import { useRouter } from "vue-router"

const router = useRouter()
const operatorStore = useOperatorStore()
const recordStore = useRecordStore()

async function createEmptyVersion() {
   recordStore.update(await createOperatorRecord(operatorStore.operator.numeroBio, {
    geojson: { type: 'FeatureCollection', features: [] },
    metadata: {
      provenance: window.location.host,
      source: sources.MANUAL,
      warnings: []
    }
  }))

  await router.push(`/exploitations/${operatorStore.operator.numeroBio}/${recordStore.record.record_id}`)
}
</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-add-line">
    <template #title>Créer une nouvelle version</template>
    <p>
      Il existe plusieurs façons de créer une nouvelle version du parcellaire.
    </p>

    <div class="fr-card fr-enlarge-link fr-mb-2w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            <router-link :to="`/exploitations/${operatorStore.operator.numeroBio}/import`" class="fr-card__link">
              Importer un parcellaire informatisé
            </router-link>
          </h3>
          <p class="fr-card__desc">
            Importez en un clic votre parcellaire informatisé via votre déclaration PAC, MesParcelles, ou Geofolia.
          </p>
        </div>
      </div>
    </div>
    <div class="fr-card fr-enlarge-link fr-mb-2w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            <a :href="`/exploitations/${operatorStore.operator.numeroBio}/nouveau`" @click.prevent="createEmptyVersion" class="fr-card__link">
              Créer à partir de zéro
            </a>
          </h3>
          <p class="fr-card__desc">
            Ajouter vos parcelles une à une, par référence cadastrale ou dessin sur la carte, sans repartir d’un parcellaire existant.
          </p>
        </div>
      </div>
    </div>
    <div class="fr-card">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
              Dupliquer une autre version
          </h3>
          <p class="fr-card__desc">
            Vous pouvez également dupliquer une version existante depuis l’écran précédent, en ouvrant le menu des
            actions de la version souhaitée.<br>
            <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/gestion-des-versions-de-parcellaire#dupliquer-un-parcellaire" target="_blank" rel="noopener">
              Voir l'aide <span class="fr-icon-arrow-right-line fr-icon--sm"></span>
            </a>
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>

</style>
