<template>
  <v-layout row wrap>
    <Navbar :bus="bus"></Navbar>
    <router-view :bus="bus"></router-view>
  </v-layout>
</template>
<script>
import Vue from "vue";
import Navbar from "@/components/Navbar";
export default {
  name: "AppLayout",
  components: {
    Navbar
  },
  data() {
    return {
      // this is used to broadcast events.
      // This Vue instance is passed as a prop to child and event are triggered on this instance.
      bus: new Vue()
    };
  }
};
</script>
