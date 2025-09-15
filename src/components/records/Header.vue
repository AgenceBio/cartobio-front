<template>
  <header class="fr-mb-2w header-class">
    <div class="name-parcellaire">
      <div class="flex-center">
        <h1 class="fr-text--md operator-name" :data-numerobio="operator.numeroBio">{{ operator.nom }}</h1>
        <template v-if="permissions.isOc">
          <button
            v-if="operatorStore.operator.epingle"
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline ri-pushpin-fill"
            @click="unpin(operatorStore.operator.numeroBio)"
            aria-label="Désepingler le parcellaire"
          ></button>
          <button
            v-else
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline ri-pushpin-line"
            @click="pin(operatorStore.operator.numeroBio)"
            aria-label="Epingler le parcellaire"
          ></button>
        </template>
      </div>
      <div class="heading">
        <div class="version-name fr-mb-1v">
          <h2 class="fr-h4 fr-my-0">
            {{ record.version_name }}
          </h2>
          <p v-if="readonly" class="readonly-badge">Lecture seule</p>
        </div>
        <button
          v-if="!disableActions && permissions.canEditVersion"
          class="fr-btn fr-btn--tertiary-no-outline fr-icon fr-icon-edit-line edit-version-info fr-hidden fr-unhidden-sm"
          @click="showEditVersionModal = true"
          aria-label="Modifier la version du parcellaire"
        >
          Modifier la version
        </button>
        <p class="state fr-subtitle">
          <ParcellaireState :record="record" />
        </p>
      </div>
    </div>

    <div
      v-if="disableActions === false"
      class="actions fr-btns-group fr-btns-group--sm fr-btns-group--inline-sm fr-btns-group--icon-left"
    >
      <button
        class="fr-btn fr-btn--icon-left fr-btn--tertiary-no-outline fr-icon-git-pull-request-fill show-versions"
        @click.stop.prevent="versionMenu = !versionMenu"
        :disabled="!isOnline"
        :aria-expanded="!!versionMenu"
        aria-label="Afficher la liste des autres versions de parcellaire"
      >
        Autres versions <span class="fr-icon-arrow-down-s-line" />
      </button>
      <div v-if="versionMenu" class="fr-menu fr-translate__menu" ref="versionMenuRef">
        <ul class="fr-menu__list">
          <li v-for="{ year, records } in operatorStore.recordsByYear" :key="year">
            <button
              class="fr-nav__link no-underline-img"
              @click.stop.prevent="versionMenu = year"
              href="#"
              :aria-label="`Afficher les parcellaires audités en ${year}`"
              :aria-expanded="versionMenu === year"
            >
              Audit {{ year }} <span class="fr-icon-arrow-right-s-line" />
            </button>
            <div class="fr-menu fr-translate__menu no-underline-img">
              <ul v-if="versionMenu === year" class="fr-menu__list fr-btns-group fr-btns-group--icon-left">
                <li v-for="record in records" :key="record?.record_id">
                  <router-link
                    :to="`/exploitations/${operator.numeroBio}/${record.record_id}`"
                    class="fr-nav__link white-space-break"
                    href="#"
                    :aria-label="`Consulter la version ${record.version_name}`"
                  >
                    {{ record.version_name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <button
        v-if="canDisplayHistory"
        class="history-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line"
        @click="historyModal = true"
        aria-label="Afficher l'historique des modifications"
      >
        Historique
      </button>

      <button
        v-if="hasFeatures && !readonly"
        class="export-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-table-2"
        @click="exportModal = true"
        aria-label="Afficher la liste de moyen d'exporter le parcellaire"
      >
        Exporter
      </button>
      <button
        v-if="hasFeatures && record.certification_state === 'CERTIFIED'"
        class="export-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-file-line"
        @click="attestationModal = true"
        aria-label="Télécharger l'attestation de production"
      >
        Attestation
      </button>
      <button
        v-if="!disableActions && permissions.canEditVersion"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon fr-icon-edit-line edit-version-info fr-hidden-sm"
        @click="showEditVersionModal = true"
        aria-label="Modifier la version du parcellaire"
      >
        Modifier la version
      </button>
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" @close="historyModal = false" />
  </Teleport>

  <Teleport to="body">
    <AsyncFeaturesExportModal
      v-if="exportModal"
      :operator="operator"
      :collection="collection"
      :record="record"
      @close="exportModal = false"
      :hasError="tags.filter((e) => e.errorMessage != undefined)"
    />
    <AsyncFeaturesExportModal
      v-if="attestationModal"
      :operator="operator"
      :collection="collection"
      :record="record"
      :only-attestation="true"
      @close="attestationModal = false"
      :hasError="tags.filter((e) => e.errorMessage != undefined)"
    />
    <DeleteParcellaireModal :record="record" v-if="deleteModal" @close="deleteModal = false" />
    <EditVersionModal v-if="showEditVersionModal" @close="showEditVersionModal = false" />
  </Teleport>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { storeToRefs } from "pinia";

import ParcellaireState from "@/components/records/State.vue";
import OperatorHistoryModal from "@/components/records/HistoryModal/index.vue";
import DeleteParcellaireModal from "@/components/records/DeleteParcelaireModal.vue";

import { useFeaturesStore } from "@/stores/features.js";
import { useOperatorStore } from "@/stores/operator.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useRecordStore } from "@/stores/record.js";
import { onClickOutside, useOnline } from "@vueuse/core";
import EditVersionModal from "@/components/forms/EditVersionForm.vue";
import { usePermissions } from "@/stores/permissions.js";
import { useUserStore } from "@/stores/user";
import { pinOperator, unpinOperator } from "@/cartobio-api";

const AsyncFeaturesExportModal = defineAsyncComponent(() => import("@/components/records/ExportModal.vue"));

defineProps({
  disableActions: {
    type: Boolean,
    default: false,
  },
});

const isOnline = useOnline();

const exportModal = ref(false);
const attestationModal = ref(false);
const historyModal = ref(false);
const deleteModal = ref(false);
const featuresStore = useFeaturesStore();
const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const permissions = usePermissions();
const { record } = recordStore;
const { operator } = operatorStore;
const featuresSets = useFeaturesSetsStore();
const { collection, hasFeatures } = storeToRefs(featuresStore);
const { tags } = storeToRefs(featuresSets);
const canDisplayHistory = computed(() => Array.isArray(record.audit_history) && record.audit_history.length);

const versionMenu = ref(false);
const versionMenuRef = ref(null);
const showEditVersionModal = ref(false);
const readonly = computed(
  () => permissions.isOc && record.oc_id != null && record.oc_id !== userStore.user?.organismeCertificateur?.id,
);
onClickOutside(versionMenuRef, ({ target }) => {
  if (!target.classList.contains("show-versions")) {
    versionMenu.value = false;
  }
});

function pin(numeroBio) {
  pinOperator(numeroBio).then(() => operatorStore.updatePinnedStatus(true));
}

function unpin(numeroBio) {
  unpinOperator(numeroBio).then(() => operatorStore.updatePinnedStatus(false));
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;

  h1 .fr-btn {
    vertical-align: text-bottom;
  }

  p.state {
    margin: 0 0 0.5rem;
    align-items: end;
    display: flex;
  }

  .heading {
    display: flex;
    align-items: end;
    gap: 1rem;
  }

  .operator-name {
    margin: 0;
  }
}

.actions {
  position: relative;
  display: flex;
  flex-direction: row;
  column-gap: 0.5rem;
  margin: 0;
  align-items: flex-end;
  justify-items: center;

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
    grid-template-columns: auto;
    grid-auto-flow: row;
    background-color: #fff;
    z-index: 1;
    position: relative;

    li {
      position: relative;
    }

    .fr-menu {
      position: absolute;
      left: 100%;
      top: 0;
      width: auto;
      white-space: nowrap;
      max-height: 500px;
      overflow: auto;
      overflow-x: hidden;
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

  .white-space-break {
    white-space: break-spaces;
    width: 35ch;
  }
}

.name-parcellaire {
  max-width: 60%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.version-name {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: flex;
  gap: 1ch;
  align-items: end;
}

.version-name h2 {
  max-width: 25ch;
}

.readonly-badge {
  padding: 0px 8px;
  border-radius: 9999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  background-color: var(--background-default-grey-active);
  margin-bottom: 0.5em;
  font-weight: 400;
  line-height: 23px;
  white-space: nowrap;
}

@media (max-width: 36em) {
  .header-class {
    flex-direction: column;
  }

  .name-parcellaire {
    max-width: 100%;
  }

  .readonly-badge {
    margin-left: 0;
  }

  header .heading {
    flex-wrap: wrap;
  }
}
.flex-center {
  display: flex;
  align-items: center;
}

.no-underline-img {
  --underline-img: none;
}
</style>
