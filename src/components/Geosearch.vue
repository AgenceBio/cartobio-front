<template>
  <v-autocomplete
    v-model="place"
    :items="results"
    :loading="loadingPlaces"
    :search-input.sync="searchText"
    item-text="city"
    no-data-text="Pas de résultats"
    prepend-inner-icon="search"
    placeholder="Recherche"
    hide-no-data
    hide-details
    clearable
    return-object
  ></v-autocomplete>
</template>
<script>
import {get} from "axios";
import {throttle} from "lodash/core";
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
      if (this.searchText.length) {
        this.loadingPlaces = true;
        let req =
          "https://wxs.ign.fr/" +
          process.env.VUE_APP_API_IGN +
          "/look4/user/search?indices=locating&method=prefix%2Cfuzzy&types=address%2Cposition%2Ctoponyme%2Cw3w&nb=5&match%5Bfulltext%5D=" +
          this.searchText;
        return get(req)
          .then(data => {
            this.results = this.formatListResults(data.data.features);
            window._paq.push(['trackSiteSearch', this.searchText, false, this.results.length])
          })
          .finally(() => (this.loadingPlaces = false));
      } else {
        this.results = [];
      }
    },
    formatListResults: function(features) {
      // return array of places with their geometry
      return features.map(function(place) {
        // add geometry to properties for a simpler use
        place.properties.geometry = place.geometry;
        return place.properties;
      });
    }
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
.v-autocomplete {
  padding-top: 0;
}
</style>
