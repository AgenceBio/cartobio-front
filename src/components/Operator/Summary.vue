<template>
  <header class="fr-mb-3w">
    <span :data-numerobio="operator.numeroBio">{{ operator.nom }}</span>
    <h1 class="fr-h4 fr-mb-2v">
      {{ record.version_name }}
      <button class="fr-link" @click="showEditVersionModal = true">
        <span class="fr-icon-edit-line" />
      </button>
    </h1>

    <p class="state fr-subtitle">
      <ParcellaireState :record="record" />
    </p>


    <div v-if="disableActions === false" class="actions fr-btns-group fr-btns-group--inline-sm fr-btns-group--icon-left">
      <nav role="navigation" class="fr-translate fr-nav">
        <div class="fr-nav-item">
          <button
              class="fr-btn fr-btn--icon-left fr-btn--tertiary-no-outline fr-icon-git-pull-request-fill show-versions"
              @click.stop.prevent="versionMenu = !versionMenu"
          >
            Comparer les versions <span class="fr-icon-arrow-down-s-line" />
          </button>
          <div v-if="versionMenu" class="fr-menu fr-translate__menu" ref="versionMenuRef">
            <ul class="fr-menu__list">
              <li v-for="{ year, records } in operatorStore.recordsByYear" :key="year">
                <a class="fr-nav__link" @click.stop.prevent="versionMenu = year" href="#">
                  Année {{ year }} <span class="fr-icon-arrow-right-s-line" />
                </a>
                <div class="fr-menu fr-translate__menu">
                  <ul v-if="versionMenu === year" class="fr-menu__list fr-btns-group fr-btns-group--icon-left">
                    <li
                        v-for="record in records"
                        :key="record?.record_id"
                    >
                      <router-link :to="`/exploitations/${operator.numeroBio}/${record.record_id}`" class="fr-nav__link" href="#">
                        {{ record.version_name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <button v-if="canDisplayHistory" class="history-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line" @click="historyModal = true">
        Historique
      </button>

      <button v-if="hasFeatures" class="export-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-road-map-line" @click="exportModal = true">
        Export
      </button>
    </div>

    <div
        v-if="permissions.isAgri && record.certification_state !== CERTIFICATION_STATE.OPERATOR_DRAFT"
        class="fr-alert fr-alert--info fr-alert--sm fr-mt-3w"
    >
      <p class="fr-text--sm">Votre parcellaire est en cours de certification, vous ne pouvez pas modifier les données.</p>
    </div>

    <div class="demandes fr-callout fr-callout--blue-ecume" v-if="displayCallout">
      <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

      <div v-html="record.audit_demandes" />
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" @close="historyModal = false" />
  </Teleport>


  <Teleport to="body">
    <FeaturesExportModal :operator="operator" :collection="collection" :record="record" v-if="exportModal" @close="exportModal = false" />
    <DeleteParcellaireModal :record="record" v-if="deleteModal" @close="deleteModal = false" />
    <EditVersionModal
        :model-value="record"
        @update:model-value="recordStore.update($event)"
        v-if="showEditVersionModal"
        @close="showEditVersionModal = false"
    />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ParcellaireState from '@/components/Certification/State.vue'
import OperatorHistoryModal from '@/components/Operator/HistoryModal.vue'
import FeaturesExportModal from '@/components/Features/ExportModal.vue'
import DeleteParcellaireModal from '@/components/Operator/DeleteParcelaireModal.vue'

import { CERTIFICATION_STATE, isCertificationImmutable } from '@/referentiels/ab.js'
import { useFeaturesStore, useOperatorStore, usePermissions, useRecordStore } from '@/stores/index.js'
import { onClickOutside } from "@vueuse/core"
import EditVersionModal from "@/components/versions/EditVersionModal.vue"

defineProps({
  disableActions: {
    type: Boolean,
    default: false
  }
})

const exportModal = ref(false)
const historyModal = ref(false)
const deleteModal = ref(false)
const featuresStore = useFeaturesStore()
const operatorStore = useOperatorStore()
const recordStore = useRecordStore()
const permissions = usePermissions()
const { record } = recordStore
const { operator } = operatorStore
const { collection, hasFeatures } = storeToRefs(featuresStore)
const displayCallout = computed(() => record.audit_demandes && isCertificationImmutable(record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(record.audit_history) && record.audit_history.length)

const versionMenu = ref(false)
const versionMenuRef = ref(null)
const showEditVersionModal = ref(false)

onClickOutside(versionMenuRef, ({ target }) => {
  if (!target.classList.contains('show-versions')) {
    versionMenu.value = false
  }
})
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;

  & > p.state {
    margin: 0 0 0.5rem;
  }
}

.actions {
  background: var(--light-background-alt-blue-france, #F5F5FE);
  display: flex;
  position: relative;
}

@media screen and (min-width: 62em) {
  .actions {
    flex-direction: row;
    margin-left: 0;
    margin-right: 0;
  }

  div.actions .fr-btn {
    margin-bottom: 0;
  }
}

/** Version menu */

.fr-menu {
  position: absolute;
  top: 100%;
  width: 9rem;
  padding: 0;
  margin: 0;

  .fr-menu__list {
    border-radius: 0.3125rem;
    margin: 0;
    width: auto;

    li {
      position: relative;
    }

    .fr-menu {
      position: absolute;
      left: 100%;
      top: 0;
      width: auto;
      white-space: nowrap;
    }
  }

  .fr-btn {
    font-weight: 700;
    justify-content: flex-start;
    margin: 0;
    padding: 0.75rem !important;
    width: 100%;
    @extend .fr-btn--tertiary-no-outline;
  }
}
</style>
