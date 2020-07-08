<template>
  <v-layout row wrap>
    <AppNavbar />
    <router-view />
  </v-layout>
</template>
<script>
import AppNavbar from "@/components/AppNavbar";
export default {
  name: "AppLayout",
  components: {
    AppNavbar
  },
};
</script>
