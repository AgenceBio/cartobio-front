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
                  <a class="fr-breadcrumb__link" href="/">Accueil</a>
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
  <section class="fr-container fr-py-5w background-white">
    <div class="fr-grid-row">
      <div class="fr-col-10 fr-m-auto fr-mb-3w">
        <h3 class="fr-h3">Rechercher une exploitation</h3>
        <form
          @submit.prevent="search(userInput)"
          class="fr-search-bar fr-search-bar--lg fr-mb-3w"
          id="header-search"
          role="search"
        >
          <label class="fr-label" for="search"> Recherche par nom d'exploitation, SIRET ou numéro bio </label>
          <input
            class="fr-input"
            placeholder="Chercher par nom d'opérateur, SIRET ou numéro bio…"
            minlength="1"
            autocomplete="cartobio-operator"
            v-model.trim="userInput"
            autofocustype="search"
            id="search"
            :disabled="!isOnline"
          />
          <button class="fr-btn" type="submit" title="Rechercher" :disabled="!isOnline">Rechercher</button>
        </form>
      </div>
      <div class="fr-col-11 fr-m-auto fr-pt-4w content">
        <DashboardChargeDeCertification v-if="isOcCertif" />
        <DashboardAuditeur v-else-if="isOcAudit" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useOnline } from "@vueuse/core";
import { useUserStore } from "@/stores/user";
import DashboardChargeDeCertification from "@/components/dashboard/ChargeDeCertification.vue";
import DashboardAuditeur from "@/components/dashboard/Auditeur.vue";
import { useRouter } from "vue-router";

const isOnline = useOnline();
const userInput = ref();
const router = useRouter();

const { user, isOcAudit, isOcCertif } = useUserStore();

function search(search) {
  return router.push({ path: "/certification/exploitations", query: { search } });
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
</style>
