<template>
  <MainHeader />
  <LoadingOverlay v-if="isRouteLoading" :fullScreen="true" :width="128" :height="128" :color="'#007bff'" />

  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <template #default>
        <main id="content" role="main" tabindex="-1">
          <component :is="Component" :key="route.meta.usePathKey ? route.path : undefined" />
        </main>
      </template>

      <template #fallback>
        <main class="fr-container fr-py-9v" id="content" role="main" tabindex="-1">
          <div class="fr-grid-row">
            <div class="fr-col-12">
              <Spinner class="fr-h5">Chargement des données …</Spinner>
            </div>
          </div>
        </main>
      </template>
    </Suspense>
  </RouterView>

  <OnBoarding />
  <MainFooter />
</template>

<script setup>
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { computed } from "vue";

import MainHeader from "@/components/MainHeader.vue";
import MainFooter from "@/components/MainFooter.vue";
import OnBoarding from "@/components/OnBoarding.vue";
import Spinner from "@/components/widgets/Spinner.vue";
import LoadingOverlay from "@/components/widgets/LoadingOverlay.vue";
import { isRouteLoading } from "@/main.js";

const route = useRoute();
const title = computed(() => route.meta?.seo?.title);

// SEO
useHead({ title, titleTemplate: "%s — CartoBio" });
</script>

<style>
@charset "utf-8";

@import "@gouvfr/dsfr/dsfr.css";
@import "@gouvfr/dsfr/utility/icons/icons.css";
@import "@/styles/variables.css";
@import "@/styles/icons.css";
@import "remixicon/fonts/remixicon.css";

a[aria-disabled] {
  --text-action-high-blue-france: gray;
  --border-action-high-blue-france: gray;
  cursor: not-allowed;
  pointer-events: none;
}

.clickable {
  cursor: pointer;
}

.fr-table {
  &.table-data table {
    @media (width >= 62em) {
      display: table;
    }
  }

  table {
    tr.clickable:hover {
      background-color: #ececfe !important;
    }
    tr.clickable:hover th:first-of-type {
      text-decoration: underline;
    }
  }
}

.fr-col--center,
.fr-grid-row--align-center {
  text-align: center;
}

.fr-background-alt--blue-france {
  background-color: var(--background-alt-blue-france);
}
.fr-background-alt--grey {
  background-color: var(--background-alt-grey);
}

.btn--error {
  color: var(--text-default-error) !important;
}
</style>
