<template>
  <v-expansion-panel-content>
    <template v-slot:header>
      <div>{{item.category}}</div>
    </template>
    <v-card>
      <v-card-text class="grey lighten-3" v-for="(subcategory, i) in item.subcategories" :key="i">
        <strong my-2>{{subcategory.label}}</strong>
        <p>{{subcategory.text}}</p>
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>
<script>
export default {
  name: "LegalItem",
  props: {
    item: Object
  }
};
</script>
<style lang="scss" scoped>
</style>

