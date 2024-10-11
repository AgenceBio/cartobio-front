<route lang="yaml">
meta:
  seo:
    title: Connexion sécurisée à votre compte
</route>

<template>
  <div class="fr-container fr-my-5w">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6 fr-p-8v fr-p-md-14v fr-background-alt--grey">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
          <div>
            <Spinner v-if="isVerifying">Vérification des informations en cours</Spinner>

            <Spinner v-else-if="!isVerifying && isLogged && (store.isOc || store.isAgri)"
              >Chargement de vos exploitations…</Spinner
            >

            <div class="fr-connect-group" v-else-if="!isLogged">
              <h1 class="fr-h2">Connexion à CartoBio</h1>

              <p class="fr-my-9v">
                <router-link to="/login/agencebio" class="fr-btn">
                  Se connecter avec mon compte Agence Bio
                </router-link>
              </p>

              <p>
                <a
                  href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/connexion"
                  class="fr-link"
                  target="_blank"
                  rel="noopener"
                  title="Qu'est-ce que mon compte Agence Bio ? - nouvelle fenêtre"
                >
                  Comment se connecter ?<lien-externe />
                </a>
              </p>
            </div>

            <div v-else-if="isLogged">
              <div class="fr-alert fr-alert--warning">
                <h3 class="fr-alert__title">Droits d'accès inadaptés</h3>
                <p>
                  Votre connexion a correctement abouti. Malheureusement nous ne sommes pas en mesure de vous identifier
                  comme un operateur agricole ou une personne travaillant au sein d'une organisme de certification.
                </p>

                <p>
                  Si vous pensez que ce n'est pas normal, contactez une personne en charge des accès à CartoBio au sein
                  de votre organisme de certification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user.js";

import { verifyToken } from "@/cartobio-api.js";

import Spinner from "@/components/widgets/Spinner.vue";

const store = useUserStore();
const route = useRoute();
const router = useRouter();

const { token, isLogged } = storeToRefs(store);
const isVerifying = ref(false);

onMounted(async () => {
  const hashOrUserToken = route.hash ? new URLSearchParams(route.hash).get("#token") : token.value;

  if (!hashOrUserToken) {
    return;
  }

  isVerifying.value = true;

  try {
    const [res] = await Promise.all([
      verifyToken(hashOrUserToken),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    if (res.id) {
      store.login(hashOrUserToken);
      router.replace("/login");
    }

    if (store.isLogged) {
      router.replace(route.query.returnto || store.startPage);
    }
  } finally {
    isVerifying.value = false;
  }
});
</script>
