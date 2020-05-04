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
import {get} from "axios";
import throttle from "lodash/throttle";
import memoize from "lodash/memoize";
import _words from "lodash/words";

const OPERATORS_ENDPOINT = process.env.VUE_APP_NOTIFICATIONS_ENDPOINT + "/api/getOperatorsByOc"

const searchTowns = throttle((townOrPostcode) => {
  const options = {
    responseType: 'json',
    params: {
      autocomplete: 1,
      type: 'municipality',
      q: townOrPostcode,
    }
  }

  return get('https://api-adresse.data.gouv.fr/search/', options)
    .then(({ data:featureCollection }) => {
      return featureCollection.features.map(({ properties, geometry }) => ({
        key: properties.id,
        postcode: properties.postcode,
        label: properties.label,
        lat: geometry.coordinates[0],
        lon: geometry.coordinates[1],
      }))
    })
}, 110)

const preloadOperators = memoize((oc) => {
  if (!oc) {
    return Promise.resolve([])
  }

  const options = {
    responseType: 'json',
    params: {
      activites: 1,
      oc,
    }
  }

  return get(OPERATORS_ENDPOINT, options)
    .then(({ data }) => data)
})

const searchOperators = ({ searchText, operators}) => {
  return Promise.resolve([])
    .then(() => {
      const words = _words(searchText.toLocaleLowerCase().trim())

      return operators
        .filter(({ title }) => title)
        .filter(({ title }) => {
          return words.every(word => title.toLocaleLowerCase().includes(word))
        })
        .slice(0, 5)
    })
}

export default {
  name: "Geosearch",

  props: {
    ocId: {
      type: Number,
      required: false
    },
  },

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
      this.$emit('operators-received', [])
    },

    search: function() {
      const { searchText } = this

      if (!searchText || searchText.length < 3) {
        return this.clear()
      }

      this.isLoading = true

      const townsP = searchTowns(searchText)
      const operatorsP = searchOperators({ searchText, operators: this._operators })

      // async results
      townsP.then(towns => this.$emit('towns-received', towns))
      operatorsP.then(operators => this.$emit('operators-received', operators))

      Promise.allSettled([townsP, operatorsP])
        .catch(console.error)
        .finally(() => this.isLoading = false)
    },
  },

  created () {
    // it costs too much for Vue.js to watch 30K objects (for large certification bodies)
    this._operators = []
    this.isLoading = true

    // we preload the operators list as we have no way
    // to directly query by OC _and_ setting a limit (like 10 results)
    preloadOperators(this.ocId).then(operators => {
      this.isLoading = false
      this._operators = operators.map(operator => ({
        ...operator,
        dateCheck: operator.dateEngagement || operator.dateMaj,
        title: operator.denominationCourante || operator.nom || operator.gerant || '#'+operator.numeroBio
      }))
    })
    .catch(console.error)
  }
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
