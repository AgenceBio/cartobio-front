<template>
  <v-list class="pt-0" dense>
    <v-divider></v-divider>
    <v-list-tile>
      <v-list-tile-action>
        <v-flex>
          <v-checkbox v-model="allSelected" label="Sélectionner tout"></v-checkbox>
          <!-- <v-btn flat>
            <v-icon>delete</v-icon>Abandonner sélection
          </v-btn>-->
        </v-flex>
      </v-list-tile-action>
    </v-list-tile>
    <v-list-group v-for="(ilot, i) in ilots" :key="i">
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content
            @mouseover="$emit('hover-ilot', ilot)"
            @mouseleave="$emit('stop-hovering-ilot', ilot)"
          >
            <v-list-tile-title>Ilot {{ilot.numIlot}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
      <v-list-tile v-for="(parcel, j) in ilot.parcels" :key="j">
        <v-list-tile-action
          @mouseover="$emit('hover-parcel', parcel)"
          @mouseleave="$emit('stop-hovering', parcel)"
        >
          <v-icon @click="selectParcel(parcel)" v-if="!parcel.properties.selected">star_border</v-icon>
          <v-icon color="blue" @click="selectParcel(parcel)" v-if="parcel.properties.selected">star</v-icon>
        </v-list-tile-action>
        <v-list-tile-content
          @mouseover="$emit('hover-parcel', parcel)"
          @mouseleave="$emit('stop-hovering', parcel)"
        >
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
    return {
      allSelected: this.checkbox
    };
  },
  methods: {
    selectParcel(parcel) {
      this.$emit("select-parcel", parcel);
      // for some reason, the icon doesn't change so we have to re-render the component
      this.$forceUpdate();
    },
    selectAll(bool) {
      this.$emit("select-all-parcels", bool);
      this.$forceUpdate();
    }
  },
  watch: {
    "parcels.features": {
      handler: function(newVal) {
        // console.log(newVal);
      },
      deep: true
    },
    allSelected: {
      handler: function(newVal) {
        this.selectAll(newVal);
      }
    }
  },
  computed: {
    // checkbox() {
    //   return _.every(this.parcels.features, function(parcel) {
    //     return parcel.properties.selected;
    //   });
    // },
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

