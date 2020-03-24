<template>
  <v-layout column align-center justify-center class="white--text">
    <h1 class="parallax-title">
      Ouvrir, enrichir et partager
      <br />les données
      parcellaires de l’agriculture biologique
    </h1>
    <router-link to="/map">
      <v-btn large flat outline round color="white">Accéder à l'application</v-btn>
    </router-link>
  </v-layout>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Title",
  components: {},
  props: {
    msg: String
  }
};
</script>

<style lang="scss" scoped>
.parallax-title {
  font-size: 36px;
}
</style>
