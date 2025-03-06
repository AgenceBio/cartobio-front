<route lang="yaml">
meta:
  requiredRoles: ["certif", "audit"]
  skipLinks:
    Recherche: "#search"
  seo:
    title: Liste des exploitations
</route>

<template>
  <section id="sous-header" class="header-exploitations">
    <div class="fr-container fr-pb-7w">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <nav role="navigation" class="fr-breadcrumb fr-mb-0">
            <div class="fr-collapse" id="breadcrumb-1">
              <ol class="fr-breadcrumb__list">
                <li>
                  <a class="fr-breadcrumb__link" :href="startPage">Accueil</a>
                </li>
                <li>
                  <a class="fr-breadcrumb__link" aria-current="page">Tableau de bord</a>
                </li>
              </ol>
            </div>
          </nav>
        </div>
        <h2 class="fr-mb-0">Bienvenue {{ user.prenom }} {{ user.nom }}</h2>
      </div>
    </div>
  </section>
  <section class="fr-container fr-py-8w background-white">
    <div class="fr-grid-row">
      <div class="fr-col-10 fr-m-auto fr-mb-5w">
        <div class="title-search fr-mb-4w">
          <h3 class="fr-h3 fr-mb-0">Rechercher une exploitation</h3>
          <button
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-btn--sm fr-icon-arrow-right-line green-link"
            @click="seeAll()"
          >
            Voir toutes les exploitations
          </button>
        </div>
        <AutoCompleteSearch />
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

const router = useRouter();

const { user, isOcAudit, isOcCertif, startPage } = useUserStore();

function seeAll() {
  return router.push({ path: "/certification/exploitations" });
}
</script>

<style scoped>
.header-exploitations {
  background: #e3fdeb;
}
.background-white {
  background-color: white;
}

.header-exploitations::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 50px;
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
</style>
