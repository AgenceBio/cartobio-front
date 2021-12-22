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
import {mapState, mapActions} from 'vuex';
import throttle from "lodash/throttle";
import _words from "lodash/words";

const searchTowns = throttle((townOrPostcode, searchIndex) => {
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
    .then(towns => ({ towns, searchIndex }))
}, 110, { leading: true, trailing: true })

const searchOperators = ({ searchText, operators}) => {
  return Promise.resolve([])
    .then(() => {
      const searchedWords = _words(searchText.toLocaleLowerCase().trim())

      return operators.features
        .map(({ properties }) => ({
          ...properties,
          dateCheck: properties.date_engagement || properties.date_maj,
        }))
        // we expect every searched words to be included in operator .name/.identity.gerant
        // next improvement would be to use npm's talisman/metrics/{sift4,jaro-winkler} algorithm to get a score and sort on that
        .filter(({ nom, identity }) => {
          return searchedWords.every(word => {
            return nom.toLocaleLowerCase().includes(word) || String(identity.gerant).toLocaleLowerCase().includes(word)
          })
        })
        .sort((a, b) => {
          const AhasPacage = Number(Boolean(a.pacage))
          const BhasPacage = Number(Boolean(b.pacage))
          return BhasPacage - AhasPacage
        })
        .slice(0, 10)
        .map(({ numerobio }) => numerobio)
    })
}

export default {
  name: "Geosearch",

  props: ['operators'],

  computed: {
    ...mapState({
      areOperatorsLoading: state => state.operators.areCertificationBodyParcelsLoading
    }),

    isLoading () {
      return Boolean(this.isSearching || this.areOperatorsLoading)
    }
  },


  data() {
    return {
      isSearching: false,
      searchText: "",
      // we use this to prevent overriding the freshest results
      // it happens when search #2 arrives after search #3
      // we expect to display search #3 results, and not search #2 if they arrive too late
      searchIndex: 0,
      lastSearchIndex: 0,
    };
  },
  components: {},
  methods: {
    ...mapActions("user", ["trackSiteSearch"]),

    clear () {
      this.$emit('towns-received', [])
      this.$emit('operators-received', [])
    },

    search: function() {
      const { searchText, operators } = this

      if (!searchText || searchText.length < 3) {
        return this.clear()
      }

      this.isSearching = true
      this.searchIndex++

      const townsP = searchTowns(searchText, this.searchIndex)
      const operatorsP = searchOperators({ searchText, operators })

      // async results
      townsP.then(({ towns, searchIndex }) => {
        this.isSearching = false

        if (searchIndex >= this.lastSearchIndex) {
          this.lastSearchIndex = searchIndex
          this.$emit('towns-received', towns)

          this.trackSiteSearch([this.searchText, 'towns', towns.length])
        }
      })

      operatorsP.then(operators => {
        this.$emit('operators-received', operators)

        const operatorsWithNoPacage = operators.filter(({ numeroPacage }) => !numeroPacage)
        this.trackSiteSearch([this.searchText, 'operators:total', operators.length])
        this.trackSiteSearch([this.searchText, 'operators:no-pacage', operatorsWithNoPacage.length])
      })

      Promise.allSettled([townsP, operatorsP])
        .catch(console.error)
    },
  },
};
</script>

<style lang="scss" scoped>
.v-text-field--box ::v-deep input {
  margin-top: 12px; // same as .solo… but with box!
}

.v-text-field ::v-deep .v-input__control > .v-input__slot::before {
  border-color: rgb(185, 208, 101);
  border-width: 3px 0 0;
}
</style>
