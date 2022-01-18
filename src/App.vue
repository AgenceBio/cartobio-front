<script setup>
import MainHeader from './components/MainHeader.vue'
</script>

<template>
  <MainHeader />

  <router-view v-bind="$attrs" />
</template>

<style>
@import 'normalize.css/normalize.css';

:root {
  --spacing: 1rem;
}

#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
