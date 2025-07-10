<template>
  <header class="fr-mb-2w">
    <div class="fr-grid-row fr-grid-row--middle header">
      <div class="fr-grid-row">
        <h2 class="fr-h4 fr-my-0">
          {{ record.version_name }}
        </h2>
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

        <p v-if="readonly" class="readonly-badge">Lecture seule</p>
      </div>
      <div class="fr-grid-row">
        <ActionDropdown v-if="hasFeatures && !readonly" with-icons icon-class="fr-icon-download-line fr-btn--sm">
          <AsyncFeaturesExportActions
            :operator="operator"
            :collection="collection"
            :record="record"
            @close="exportModal = false"
            :hasError="tags.filter((e) => e.errorMessage != undefined)"
          />
        </ActionDropdown>
        <ActionDropdown
          v-if="!disableActions && permissions.canEditVersion"
          with-icons
          icon-class="ri-more-2-line fr-btn--sm"
          icon-style="font-size: 1.2em"
        >
          <li>
            <button
              v-if="!disableActions && permissions.canEditVersion"
              class="fr-btn fr-icon-edit-line fr-btn--tertiary-no-outline"
              @click="showEditVersionModal = true"
              aria-label="Modifier la version du parcellaire"
            >
              Modifier la version
            </button>
          </li>
        </ActionDropdown>
      </div>
    </div>

    <p class="state fr-subtitle">
      <ParcellaireState :record="record" />
    </p>
    <!-- 
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
        v-if="!disableActions && permissions.canEditVersion"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon fr-icon-edit-line edit-version-info fr-hidden-sm"
        @click="showEditVersionModal = true"
        aria-label="Modifier la version du parcellaire"
      >
        Modifier la version
      </button>
    </div> -->
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
import ActionDropdown from "../widgets/ActionDropdown.vue";

const AsyncFeaturesExportActions = defineAsyncComponent(() => import("@/components/records/ExportActions.vue"));

defineProps({
  disableActions: {
    type: Boolean,
    default: false,
  },
});

const isOnline = useOnline();

const exportModal = ref(false);
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
.header {
  justify-content: space-between;
}
</style>
