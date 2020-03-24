<template>
  <v-layout column align-center justify-space-between py-5>
    <h1 class="parallax-title">
      Ouvrir, enrichir et partager
      <br />les données
      parcellaires de l’agriculture biologique
    </h1>

    <v-btn to="/map" large outline round color="primary" class="mb-5 mt-4">
      Accéder à l'application
    </v-btn>

    <v-card>
      <v-img contain lazy-src="@/assets/cartobio-screenshot.jpg" src="@/assets/cartobio-screenshot.jpg" aspect-ratio="1.92" width="640"></v-img>
    </v-card>
  </v-layout>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Title",
};
</script>

<style lang="scss" scoped>
.parallax-title {
  font-size: 36px;
}
</style>
