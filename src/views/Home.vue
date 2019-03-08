<template>
  <v-layout column align-center justify-center class="white--text">
    <h1>{{msg}}</h1>
  </v-layout>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Home",
  components: {},
  props: {
    msg: String
  }
};
</script>
<style lang="scss" scoped>
</style>
