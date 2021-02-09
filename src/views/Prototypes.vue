<template>
  <v-content>
    <v-container>
      <v-layout row>
        <ParcelsAutoComplete />
      </v-layout>
    </v-container>
  </v-content>
</template>

<style lang="scss" scoped>
.digits {
  font-size: 3em;
  line-height: 1;
  display: block;
}

.v-content {
  flex: 1 0 100% !important;
}
</style>

<script>
// import { mapGetters } from 'vuex'
import ParcelsAutoComplete from '../components/Prototypes/ParcelsAutoComplete.vue'

export default {
  name: "Prototypes",

  metaInfo: {
    title: 'Prototypes CartoBio',
  },

  components: {
    ParcelsAutoComplete
  }

};
</script>

