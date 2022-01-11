<script setup>
</script>

<template>
  <h1><router-link to="/">CartoBio</router-link></h1>

  <router-view v-bind="$attrs" />
</template>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
