<template>
  <header>
    <h1><router-link to="/" rel="home">CartoBio</router-link></h1>

    <nav class="main-navigation">
      <ul>
        <li v-if="state.currentUser">
          👤 {{ state.currentUser.commercial_name }}
        </li>
        <li>
          <a href="#">Aide</a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import store from '../store.js'

const { state } = store
</script>

<style lang="postcss" scoped>
header {
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) / 2) var(--spacing);
}

header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
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
