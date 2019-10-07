<template>
  <v-list class="pt-0" dense>
    <v-divider></v-divider>

    <v-list-group v-for="(ilot, i) in ilots" :key="i">
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-title>Ilot {{ilot.numIlot}}</v-list-tile-title>
        </v-list-tile>
      </template>
      <v-list-tile v-for="(parcel, j) in ilot.parcels" :key="j">
        <v-list-tile-content>
          <v-list-tile-title>Parcelle {{parcel.properties.numparcel}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list-group>
  </v-list>
</template>
<script>
export default {
  name: "ParcelsList",
  props: {
    parcels: Object
  },
  data() {
    return {};
  },
  computed: {
    ilots() {
      // first reduce to group parcels by ilots
      let reduced = _.reduce(
        this.parcels.features,
        function(result, parcel) {
          let numIlot = _.get(parcel, ["properties", "numilot"]);
          result[numIlot]
            ? result[numIlot].push(parcel)
            : (result[numIlot] = [parcel]);
          return result;
        },
        {}
      );
      // then put them into an array with easily accessible ilot number
      let ilots = _.reduce(
        reduced,
        function(result, value, key) {
          result.push({ numIlot: key, parcels: value });
          return result;
        },
        []
      );
      return ilots;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

