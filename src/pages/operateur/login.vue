<template>
  <h2>
    Votre exploitation
    <small class="tag">Cet outil est actuellement en phase de test</small>
  </h2>

  <form v-if="!candidateUser.id" @submit.prevent="tryLogin">
    <div class="row">
      <label>
        Rechercher
        <input type="text" name="search" v-model="userLogin" ref="loginInput" required autofocus />

        <button type="submit" :disabled="isLoading">
          <vue-feather type="loader" animation="spin" v-if="isLoading" />
          <span v-else>OK</span>
        </button>
      </label>

      <p class="help">
        Par <span v-for="({ id, label }) in LOGIN_TYPES" :aria-selected="userLoginType.includes(id)" :key="id">
          {{ label }}
        </span>…
      </p>
    </div>
  </form>

  <form v-else @submit.prevent="loginCandidateUser">
    <h3>{{ candidateUser.nom }} <vue-feather type="check-square" size="16" /></h3>

    <dl class="candidateUser">
      <dt>Dénomination courante</dt>
      <dd>{{ candidateUser.denominationCourante }}</dd>
      <dt>Numéro de SIRET</dt>
      <dd>{{ candidateUser.siret }}</dd>
      <dt>Numéro PACAGE</dt>
      <dd>{{ candidateUser.numeroPacage }}</dd>
      <dt>Numéro Bio</dt>
      <dd>{{ candidateUser.id }}</dd>
      <dt>Date d'engagement</dt>
      <dd>{{ candidateUser.dateEngagement }}</dd>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import store from '../../store.js'

const router = useRouter()
const loginInput = ref(null)
const userLogin = ref('')
const isLoading = ref(false)
let candidateUser = store.state.currentUser

const LOGIN_TYPES = [
  { id: 'name', label: "nom" },
  { id: 'siret', label: "SIRET" },
  { id: 'email', label: "email" },
  { id: 'farm-name', label: "nom d’exploitation" },
  // { id: 'phone', label: "numéro de téléphone" },
  { id: 'pacage', label: "numéro PACAGE" },
]

const userLoginType = computed(() => {
  const cleanedInput = userLogin.value.trim()
  const cleanedInputWithoutSpaces = cleanedInput.replace(/ /g, '')

  //
  if (/^[0-9]{8,9}$/i.test(cleanedInputWithoutSpaces)) {
    return ['pacage']
  }
  //
  else if (/^[0-9]{14}$/i.test(cleanedInputWithoutSpaces)) {
    return ['siret']
  }
  // 0102030405
  // +33102030405
  // else if (/^[0-9]{10}$/i.test(cleanedInputWithoutSpaces) || /^\+[0-9]{2}[0-9]{9}$/i.test(cleanedInputWithoutSpaces)) {
  //   return ['phone']
  // }
  // via https://github.com/sindresorhus/email-regex/blob/main/index.js
  else if (new RegExp('^[^\\.\\s@:](?:[^\\s@:]*[^\\s@:\\.])?@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*$').test(cleanedInputWithoutSpaces)) {
    return ['email']
  }
  // arbitrary length… maybe not a great idea
  else if (cleanedInputWithoutSpaces.length > 3) {
    return ['name', 'farm-name']
  }

  return []
})


onMounted(() => loginInput.value?.focus())

async function tryLogin () {
  isLoading.value = true

  const result = await fetch(`${import.meta.env.VUE_APP_API_ENDPOINT}/v1/tryLogin`, {
    method: 'POST',
    body: JSON.stringify({ q: userLogin.value }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())

  isLoading.value = false

  Object.assign(candidateUser, result)
}

function loginCandidateUser () {
  store.loginUser(candidateUser)
  router.push('/operateur/setup')
}
</script>

<style scoped>
span[aria-selected="true"] {
  font-weight: bold;
}

.help span:not(:last-of-type)::after {
  content: ", ";
}

dl.candidateUser {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 2fr;
  max-width: 640px;
}

  dl.candidateUser dt {
    font-weight: bold;
    text-align: right;
  }

  dl.candidateUser dd {
    margin: 0;
  }
</style>
