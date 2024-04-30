<template>
  <header class="fr-mb-2w">
    <span class="fr-text--bold" :data-numerobio="operator.numeroBio">{{ operator.nom }}</span>
    <h1 class="fr-h4 fr-my-0 fr-mb-1v">
      {{ record.version_name }}

      <button v-if="!disableActions" class="fr-btn fr-btn--tertiary-no-outline fr-icon fr-icon-edit-line" @click="showEditVersionModal = true">
        Modifier la version
      </button>
    </h1>

    <p class="state fr-subtitle">
      <ParcellaireState :record="record" />
    </p>


    <div v-if="disableActions === false" class="actions fr-btns-group fr-btns-group--sm fr-btns-group--inline-sm fr-btns-group--icon-left">
      <nav role="navigation" class="fr-translate fr-nav">
        <div class="fr-nav-item">
          <button
              class="fr-btn fr-btn--icon-left fr-btn--tertiary-no-outline fr-icon-git-pull-request-fill show-versions"
              @click.stop.prevent="versionMenu = !versionMenu"
          >
            Autres versions <span class="fr-icon-arrow-down-s-line" />
          </button>
          <div v-if="versionMenu" class="fr-menu fr-translate__menu" ref="versionMenuRef">
            <ul class="fr-menu__list">
              <li v-for="{ year, records } in operatorStore.recordsByYear" :key="year">
                <a class="fr-nav__link" @click.stop.prevent="versionMenu = year" href="#">
                  Audit {{ year }} <span class="fr-icon-arrow-right-s-line" />
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

      <button v-if="hasFeatures" class="export-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-table-2" @click="exportModal = true">
        Exporter
      </button>
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" @close="historyModal = false" />
  </Teleport>


  <Teleport to="body">
    <AsyncFeaturesExportModal v-if="exportModal" :operator="operator" :collection="collection" :record="record" @close="exportModal = false" />
    <DeleteParcellaireModal :record="record" v-if="deleteModal" @close="deleteModal = false" />
    <EditVersionModal
        v-if="showEditVersionModal"
        @close="showEditVersionModal = false"
    />
  </Teleport>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ParcellaireState from '@/components/record/State.vue'
import OperatorHistoryModal from '@/components/record/modals/HistoryModal.vue'
import DeleteParcellaireModal from '@/components/record/modals/DeleteParcelaireModal.vue'

import { useFeaturesStore } from "@/stores/features.js"
import { useOperatorStore } from "@/stores/operator.js"
import { useRecordStore } from "@/stores/record.js"
import { onClickOutside } from "@vueuse/core"
import EditVersionModal from "@/components/versions/EditVersionModal.vue"

const AsyncFeaturesExportModal = defineAsyncComponent(() => import('@/components/record/modals/ExportModal.vue'))

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
const { record } = recordStore
const { operator } = operatorStore
const { collection, hasFeatures } = storeToRefs(featuresStore)
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

  h1 .fr-btn {
    vertical-align: text-bottom;
  }

  & > p.state {
    margin: 0 0 0.5rem;
  }
}

.actions {
  position: relative;
  display: flex;
  flex-direction: row;
  column-gap: 0.5rem;
  margin: 0;

  .fr-btn {
    margin: 0;
    flex-grow: 0;
    width: auto;
  }
}

/** Version menu */

.fr-menu {
  position: absolute;
  top: 100%;
  left: 0.5rem;
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
