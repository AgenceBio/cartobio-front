<template>
  <v-layout row wrap>
    <Navbar />
    <Map :latLonZoom="latLonZoom" :numeroBio="numeroBio" />
  </v-layout>
</template>
<script>
import Navbar from "@/components/Navbar";
import Map from "@/views/Map";
export default {
  name: "AppLayout",

  components: {
    Navbar,
    Map,
  },

  props: {
    latLonZoom: {
      type: String,
    },
    numeroBio: {
      type: String,
      default: null
    }
  }
};
</script>
