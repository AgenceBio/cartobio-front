<template>
  <header>
    <h1><router-link to="/" rel="home">CartoBio</router-link> <sup aria-hidden>(beta)</sup></h1>

    <nav class="main-navigation">
      <ul>
        <li v-if="currentUser.id">
          <vue-feather type="user" stroke-width="2" size="16" /> {{ currentUser.nom }}
        </li>
        <li v-if="currentUser.id">
          <router-link to="/operateur/parcellaire">
            <vue-feather type="map" stroke-width="2" size="16" />
            Mon parcellaire
          </router-link>
        </li>
        <li v-if="currentUser.id">
          <router-link to="/logout" custom v-slot="{ href }">
            <a :href="href" @click.prevent="logout">
              <vue-feather type="log-out" stroke-width="2" size="16" />
              Déconnexion
            </a>
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import store from '../store.js'

const router = useRouter()

const currentUser = toRef(store.state, 'currentUser')
function logout () {
  store.logoutUser()
  router.replace('/')
}
</script>

<style lang="postcss" scoped>
header {
  background-color: #C4C4C4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) / 2) var(--spacing);
  position: sticky;
  top: 0;
  z-index: 100;
}

header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}
  header h1 sup {
    font-size: .8rem;
  }

header nav {

}

header nav ul {
  display: flex;
  gap: .5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

</style>
