<template>
  <v-layout row wrap>
    <Navbar />
    <router-view />
    <Partners />
  </v-layout>
</template>

<script>
import Navbar from "@/components/Navbar";
import Partners from "@/components/Partners";
export default {
  name: "ContentPagesLayout",
  components: {
    Navbar,
    Partners
  },
};
</script>
