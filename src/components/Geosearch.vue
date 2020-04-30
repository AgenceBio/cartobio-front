<template>
  <v-text-field box clearable hide-details
    v-model="searchText"
    @click:clear="clear"
    @input="search"
    browser-autocomplete="postal-code address-level2"
    :loading="isLoading"
    prepend-inner-icon="search">
  </v-text-field>
</template>

<script>
import {get as _get} from "axios";
import throttle from "lodash/throttle";

const get = throttle(_get, 200);

export default {
  name: "Geosearch",

  data() {
    return {
      isLoading: false,
      searchText: "",
    };
  },
  components: {},
  methods: {
    clear () {
      this.$emit('towns-received', [])
    },

    search: function() {
      const { searchText:q } = this

      if (!q || q.length < 3) {
        return this.clear()
      }

      this.isLoading = true

      const options = {
        responseType: 'json',
        params: {
          autocomplete: 1,
          type: 'municipality',
          q,
        }
      }

      get('https://api-adresse.data.gouv.fr/search/', options)
        .then(({ data:featureCollection }) => {
          const towns = featureCollection.features.map(({ properties, geometry }) => ({
            key: properties.id,
            postcode: properties.postcode,
            label: properties.label,
            lat: geometry.coordinates[0],
            lon: geometry.coordinates[1],
          }))

          this.$emit('towns-received', towns)
        })
        .catch(console.error)
        .finally(() => this.isLoading = false)

        //
    },
  },
};
</script>

<style lang="scss" scoped>
.v-text-field--box /deep/ input {
  margin-top: 12px; // same as .solo… but with box!
}

.v-text-field /deep/ .v-input__control > .v-input__slot::before {
  border-color: rgb(185, 208, 101);
  border-width: 3px 0 0;
}
</style>
