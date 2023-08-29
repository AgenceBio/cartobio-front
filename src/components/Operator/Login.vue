<template>
  <div>
    <h2 class="fr-h3">
      Sélectionner mon exploitation
    </h2>

    <form @submit.prevent="tryLogin" class="fr-search-bar fr-search-bar--lg fr-col-lg-8" id="header-search" role="search">
      <label class="fr-label" for="search-784-input">
          Recherche
      </label>
      <input class="fr-input" placeholder="Votre SIRET ou nom d'exploitation" v-model="userLogin" ref="loginInput" required autofocustype="search" id="search-784-input">
      <button class="fr-btn" title="Rechercher" :disabled="isLoading">
        Rechercher
      </button>
    </form>

    <p v-if="hasCandidateUsers" class="fr-my-3w">
      <button class="fr-link fr-icon-close-circle-line" @click="resetSearch">
        Annuler cette recherche
      </button>
    </p>

    <p id="text-input-error-desc-error" class="fr-error-text" v-if="error">
      {{ error }}
    </p>

    <div class="fr-alert fr-alert--info fr-mt-2w fr-mb-2w fr-alert--waiting" v-if="isLoading" role="alert">
      <p><em>Recherche en cours</em></p>
    </div>

    <section class="fr-grid-row fr-grid-row--gutters" v-if="hasCandidateUsers">
      <article class="fr-col-12 fr-col-md-4" v-for="candidateUser in candidateUsers" :key="candidateUser.id">
        <div class="fr-card fr-card--horizontal">
          <div class="fr-card__body">
              <div class="fr-card__content">
                  <h4 class="fr-card__title">{{ candidateUser.nom }}</h4>
                  <div class="fr-card__desc">
                    <ul class="list-unstyled">
                      <li v-if="candidateUser.commune"><strong>Siège</strong> : {{ candidateUser.commune }} ({{ candidateUser.departement }})</li>
                      <li v-if="candidateUser.denominationCourante && candidateUser.denominationCourante !== candidateUser.nom"><b>Dénomination courante</b> : {{ candidateUser.denominationCourante }}</li>
                      <li v-if="candidateUser.siret"><b>SIRET</b> : {{ candidateUser.siret }}</li>
                      <li v-if="candidateUser.numeroPacage"><b>PACAGE</b> : {{ candidateUser.numeroPacage }}</li>
                      <li><b>Numéro Bio</b> : {{ candidateUser.numeroBio }}</li>
                      <li><b>Date d'engagement</b> : {{ candidateUser.dateEngagement }}</li>
                    </ul>
                  </div>
                  <div class="fr-card__start">
                      <ul class="fr-tags-group">
                          <li>
                              <p class="fr-badge fr-badge--success fr-icon-medal-fill">vérifié</p>
                          </li>
                      </ul>
                  </div>
                </div>

                <div class="fr-card__footer">
                  <ul class="fr-btns-group  fr-btns-group--inline-lg">
                      <li>
                        <button class="fr-btn" @click.prevent="loginCandidateUser(candidateUser)">
                          Confirmer cette identité
                        </button>
                      </li>
                  </ul>
                </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { statsPush } from "@/stats.js"

const userStore = useUserStore()
const router = useRouter()
const loginInput = ref(null)
const userLogin = ref('')
const cleanedInput = computed(() => userLogin.value.trim())

const isLoading = ref(false)
const error = ref('')
const candidateUsers = ref([])
const hasCandidateUsers = computed(() => Boolean(candidateUsers.value.length))

onMounted(() => loginInput.value?.focus())

function resetSearch () {
  candidateUsers.value = []
  userLogin.value = ''
  loginInput.value.focus()
  statsPush(['trackEvent', 'Login', 'Réinitialiser la recherche'])
}

async function tryLogin () {
  isLoading.value = true
  error.value = ''
  candidateUsers.value = []

  try {
    candidateUsers.value = await fetch(`${import.meta.env.VUE_APP_API_ENDPOINT}/v2/tryLogin`, {
      method: 'POST',
      body: JSON.stringify({ q: cleanedInput.value }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())

    statsPush(['trackEvent', 'Login', 'Recherche opérateur', cleanedInput.value])
  }
  catch (e) {
    error.value = 'La requête n\'a pas pu aboutir. Pouvez-vous réessayer dans quelques secondes ?'

    throw e
  }
  finally {
    isLoading.value = false
  }

}

async function loginCandidateUser (candidateUser) {
  const persistentToken = await fetch(`${import.meta.env.VUE_APP_API_ENDPOINT}/v2/temporaryLoginWithToken`, {
    method: 'POST',
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${candidateUser.temporaryLoginToken}`
    }
  }).then(res => res.text())

  statsPush(['trackEvent', 'Login', "Sélection d'opérateur"])

  userStore.login(persistentToken)
  router.push('/exploitation/parcellaire')
}
</script>

<style scoped>
span[aria-selected="true"] {
  font-weight: bold;
}

.help span:not(:last-of-type)::after {
  content: ", ";
}

.list-unstyled {
  --ul-type: none;
  --ul-start: 0;
}

.fr-alert--waiting::before {
  mask-image: url(@gouvfr/dsfr/icons/system/time-fill.svg);
}

</style>
