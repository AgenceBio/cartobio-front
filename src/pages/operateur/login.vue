<template>
  <h2>
    Votre exploitation
    <small class="tag">Cet outil est actuellement en phase de test</small>
  </h2>

  <form v-if="!candidateUser.id" @submit.prevent="tryLogin">
    <div class="row">
      <label>
        Rechercher
        <input type="search" name="search" ref="loginInput" autofocus />
        <button type="submit">OK</button>
      </label>

      <p class="help">
        Par nom, SIRET, email, nom d’exploitation, numéro PACAGE…
      </p>
    </div>
  </form>

  <form v-else @submit.prevent="loginStaticUser">
    <h3>{{ candidateUser.commercial_name }} <vue-feather type="check-square" size="16" /></h3>

    <dl>
      <dt>Nom de l’exploitant·e</dt>
      <dd>{{ candidateUser.name }}</dd>
      <dt>Numéro de SIRET</dt>
      <dd>{{ candidateUser.siret }}</dd>
      <dt>Numéro PACAGE</dt>
      <dd>{{ candidateUser.pacage }}</dd>
    </dl>

    <p>
      <button type="submit">
        <vue-feather type="lock"></vue-feather>
        Confirmer mon identité
      </button>

      <!-- Un email vous sera envoyé à votre adresse professionnelle :
      {{ candidateUser.email }} -->
    </p>
  </form>

</template>

<script setup>
import { readonly, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import store from '../../store.js'
const router = useRouter()
const loginInput = ref(null)

const staticUser = readonly({
  id: 1234,
  name: 'Jean Dupont',
  commercial_name: 'GAEC de la Tête d\'Or',
  email: 'jean.dupont@email.com',
  siret: 'XXXXXXXX',
  pacage: '999100540',
})

let candidateUser = store.state.currentUser

onMounted(() => loginInput.value?.focus())

function tryLogin () {
  Object.assign(candidateUser, staticUser)
}

function loginStaticUser () {
  store.loginUser(staticUser)
  router.push('/operateur/setup')
}
</script>
