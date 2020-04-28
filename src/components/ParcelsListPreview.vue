<template>
  <v-card>
      <v-toolbar card dark class="color-title">
        <v-card-title>
          <h3 class="headline mb-0">Aperçu des données</h3>
        </v-card-title>
        <v-spacer />
        <v-btn icon outline @click="$emit('close-dialog')">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table hide-actions :headers="headers" :items="features">
        <template v-slot:items="{ item: feature }">
          <td v-for="({value}) in headers" :key="value">
            {{ feature.properties[value] }}
          </td>
        </template>
      </v-data-table>
    </v-card-text>
    <v-divider class="pt-2"></v-divider>
    <v-card-actions class="justify-center px-4 py-3">
      <v-btn round color="#CDDC39" @click="$emit('download-csv')">
        Télécharger
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "ParcelsArray",
  props: {
    features: Array
  },
  data() {
    return {
      headers: [
        ['numilot', 'ilot'],
        ['numparcel', 'parcelle'],
        ['bio', 'bio'],
        ['codecultu', 'codeCulture'],
        ['surfgeo', 'surfaceGeometrique'],
        ['surfadm', 'surfaceAdmissible']
      ].map(([value, text]) => ({ text, value }))
    };
  }
};
</script>

<style scoped>
    .color-title {
        background-color: #457382;
        color: white;
    }
</style>
