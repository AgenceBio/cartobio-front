<template>
  <v-layout column align-center justify-space-between py-5>
    <h1>
      Les données de l'Agriculture Biologique en France
    </h1>

    <span>
      <v-btn to="/features/organismes-certification-bio" large outline round color="primary" class="mb-5 mt-4">
        Pour mon organisme de certification
      </v-btn>

      <v-btn to="/features/territoires" large outline round color="primary" class="mb-5 mt-4">
        Sur mon territoire
      </v-btn>
    </span>

    <v-card>
      <v-img contain src="@/assets/cartobio-screenshot.jpg?lazy" aspect-ratio="1.92" width="640"></v-img>
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
h1 {
  font-size: 36px;
}
</style>
