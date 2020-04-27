<template>
  <v-autocomplete v-model="place"
    :search-input.sync="searchText"
    prepend-inner-icon="search"
    box
    loading
    single-line
    hide-no-data
    hide-details
    clearable
    return-object
  ></v-autocomplete>
</template>

<script>
// import {get} from "axios";
import throttle from "lodash/throttle";
export default {
  name: "Geosearch",

  data() {
    return {
      place: null,
      results: [],
      searchText: "",
      searchResult: {},
      loadingPlaces: false
    };
  },
  components: {},
  methods: {
    search: function() {
    },
  },
  created: function() {
    // limit search execution to once every 500ms to not flood the API
    this.throttledSearch = throttle(this.search, 500);
  },
  watch: {
    searchText(value) {
      if (!value) {
        return;
      }
      this.throttledSearch();
    },

    place(value) {
      this.$emit("searchCompleted", value);
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
