<template>
  <div>
    <v-flex class="xs12 d-flex" v-for="parcel in parcels" :key="parcel.ilot + '.' + parcel.parcelle">
      <v-text-field v-model="parcel.ilot" />
      <v-text-field v-model="parcel.parcelle" />
      <v-text-field v-model="parcel.com" />
      <v-text-field v-model="parcel.cadastre_id" />
      <v-text-field v-model="parcel.culture_type" />
      <v-text-field v-model="parcel.engagement_date" />
      <v-select v-model="parcel.niveau_conversion" :items="conversion_levels" />
    </v-flex>
  </div>
</template>

<script>

export default {
  computed: {
  },


  data() {
    return {
      conversion_levels: ["C1", "C2", "C3", "BIO", "CONV"],
      parcels: [
        {
          "ilot": 1,
          "parcelle": 1,
          "com": "26108"
        }
      ]
    };
  },
  components: {},
  methods: {
  },
};
</script>

<style lang="scss" scoped>
</style>
