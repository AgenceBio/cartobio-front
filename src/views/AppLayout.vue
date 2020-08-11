<template>
  <v-layout row wrap>
    <Navbar />
    <router-view />
  </v-layout>
</template>
<script>
import Navbar from "@/components/Navbar";
export default {
  name: "AppLayout",
  components: {
    Navbar
  },
};
</script>
