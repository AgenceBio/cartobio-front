<route lang="yaml">
meta:
  requiredRoles: ["certif", "audit"]
  forbiddenRoles: ["admin"]
  skipLinks:
    Recherche: "#search"
  seo:
    title: Liste des exploitations
</route>

<template>
  <section id="sous-header" class="header-exploitations">
    <div :class="isMobile ? 'fr-container fr-pb-2w' : 'fr-container fr-pb-4w'">
      <div class="fr-grid-row fr-grid-row--gutters fr-pt-5w">
        <div class="fr-col-12">
          <h2 class="fr-mb-0">Bienvenue {{ user.prenom }} {{ user.nom }}</h2>
        </div>
      </div>
    </div>
  </section>
  <section :class="isMobile ? 'fr-container' : 'fr-container fr-py-9v white-background'">
    <div class="fr-grid-row">
      <div class="fr-m-auto" :class="isMobile ? 'fr-col-12 fr-mb-5v' : 'fr-col-10 fr-mb-5w'">
        <div v-if="!isMobile" class="title-search fr-mb-4w">
          <h3 class="fr-h3 fr-mb-0">Rechercher une exploitation</h3>
          <button
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-btn--sm fr-icon-arrow-right-line green-link"
            @click="seeAll()"
          >
            Voir toutes les exploitations
          </button>
        </div>
        <AutoCompleteSearch
          :placeholder="isMobile ? 'Rechercher...' : null"
          :class="{ 'mobile-autocomplete': isMobile }"
        />
        <div v-if="isMobile" class="title-search">
          <button
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-btn--sm fr-icon-arrow-right-line green-link"
            @click="seeAll()"
          >
            Voir toutes les exploitations
          </button>
        </div>
      </div>
      <div class="fr-col-11 fr-m-auto fr-pt-4w content">
        <DashboardChargeDeCertification v-if="isOcCertif" />
        <DashboardAuditeur v-else-if="isOcAudit" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import DashboardChargeDeCertification from "@/components/dashboard/ChargeDeCertification.vue";
import DashboardAuditeur from "@/components/dashboard/Auditeur.vue";
import { useRouter } from "vue-router";
import "@algolia/autocomplete-theme-classic";
import AutoCompleteSearch from "@/components/operator/AutoCompleteSearch.vue";
import { useIsMobile } from "@/composables/useIsMobile";

const router = useRouter();
const isMobile = useIsMobile();

const { user, isOcAudit, isOcCertif } = useUserStore();

function seeAll() {
  return router.push({ path: "/certification/exploitations" });
}
</script>

<style scoped>
.header-exploitations {
  background: #e3fdeb;
}

.white-background {
  background-color: white;
  z-index: 10;
}

.header-exploitations::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 80px;
  background: #e3fdeb;
  z-index: -1;
}

span[aria-selected="true"] {
  font-weight: bold;
}

.content {
  border-top: solid 1px #cfcfcf;
}

.title-search {
  display: flex;
  justify-content: space-between;
}

.green-link {
  color: #18753c;
}

.flex-column {
  flex-direction: column;
}

.mobile-autocomplete {
  margin-left: 10px;
  margin-right: 10px;
  padding: 10px;
  background-color: white;
}

@media (max-width: 48em) {
  .title-search {
    justify-content: center;
  }

  .fr-collapse .fr-collapse--expanded::before {
    content: none;
  }

  .header-exploitations::after {
    content: "";
    position: absolute;
    left: 0;
    width: 100%;
    height: 60px;
    background: #e3fdeb;
    z-index: -1;
  }
}
</style>
