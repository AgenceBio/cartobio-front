<template>
  <div>
    <Spinner v-if="isVerifying">Vérification des informations en cours</Spinner>

    <Spinner v-else-if="(!isVerifying && isLogged && permissions.isOc)">Chargement de votre liste clients…</Spinner>

    <div class="fr-connect-group" v-else-if="!isLogged">
      <p>
        L'accès à CartoBio s'effectue avec l'aide de votre compte Agence Bio&nbsp;:
      </p>

      <button class="fr-connect fr-connect--agence-bio" @click="router.push('/login/agencebio?mode=certification')">
        <span class="fr-connect__login">S'identifier avec</span>
        <span class="fr-connect__brand">Agence Bio</span>
      </button>

      <p>
        <a href="https://notification.agencebio.org/faq" target="_blank" rel="noopener" title="Qu'est-ce que mon compte Agence Bio ? - nouvelle fenêtre">
          Qu'est-ce que mon compte Agence Bio ?
        </a>
      </p>
    </div>

    <div v-else-if="isLogged">
      <div class="fr-alert fr-alert--warning">
        <h3 class="fr-alert__title">Droits d'accès inadaptés</h3>
        <p>
          Votre connexion a correctement abouti.
          Malheureusement nous ne sommes pas en mesure de vous identifier comme
          étant une personne travaillant au sein d'une organisme de certification.
        </p>

        <p>
          Si vous pensez que ce n'est pas normal, contactez une personne
          en charge des accès à CartoBio au sein de votre organisme de certification.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.js'

import { verifyToken } from '@/cartobio-api.js'

import Spinner from '@/components/Spinner.vue'
import { usePermissions } from "@/stores/permissions.js"

const store = useUserStore()
const permissions = usePermissions()
const route = useRoute()
const router = useRouter()

const { token, isLogged } = storeToRefs(store)
const isVerifying = ref(false)

onMounted(async () => {
  const hashOrUserToken = route.hash ? (new URLSearchParams(route.hash)).get('#token') : token.value

  if (!hashOrUserToken) {
    return
  }

  isVerifying.value = true

  try {
    const [res] = await Promise.all([
      verifyToken(hashOrUserToken),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ])

    if (res.id) {
      store.login(hashOrUserToken)
      router.replace('/login')
    }

    if (permissions.isOc) {
      router.replace(route.query.returnto || '/certification/exploitations')
    }
  }
  finally {
    isVerifying.value = false
  }
})
</script>


<style scoped>
.fr-connect--agence-bio::before {
  background-image: url('@/assets/logo-agence-bio.svg?inline');
  background-size: contain;
  height: 2.5rem;
}
.fr-connect--agence-bio {
  --brand-color: #006E38;
  border: 1px solid var(--brand-color);
  border-radius: 5px;
  color: currentColor;
  background-color: transparent;
}
  .fr-connect--agence-bio:hover {
    background-color: var(--background-raised-grey-hover);
  }

    .fr-connect--agence-bio .fr-connect__brand {
      color: var(--brand-color);
    }
</style>

