<template>
  <v-data-table :headers="headers" :items="parcelData" hide-actions>
    <template v-slot:items="props">
      <td class="text-xs-right">{{ props.item.numerobio }}</td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.agroforest" lazy persistent @save="save">
          <div>{{ props.item.agroforest }}</div>
          <template v-slot:input>
            <div class="mt-3 title">Agroforesterie?</div>
          </template>
          <template v-slot:input>
            <v-text-field
              v-model="props.item.agroforest"
              label="Edit"
              single-line
              counter
              autofocus
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.bio" lazy persistent @save="save">
          <div>{{ props.item.bio }}</div>
          <template v-slot:input>
            <div class="mt-3 title">Bio?</div>
          </template>
          <template v-slot:input>
            <v-text-field v-model="props.item.bio" label="Edit" single-line counter autofocus></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.codecultu" lazy persistent @save="save">
          <div>{{ props.item.codecultu }}</div>
          <template v-slot:input>
            <div class="mt-3 title">Code Culture</div>
          </template>
          <template v-slot:input>
            <v-text-field v-model="props.item.codecultu" label="Edit" single-line counter autofocus></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">
        <v-menu
          ref="menu1"
          v-model="menu1"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="dateFormatted"
              hint="DD/MM/YYYY format"
              persistent-hint
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
      </td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.maraichage" lazy persistent @save="save">
          <div>{{ props.item.maraichage }}</div>
          <template v-slot:input>
            <div class="mt-3 title">maraichage?</div>
          </template>
          <template v-slot:input>
            <v-text-field
              v-model="props.item.maraichage"
              label="Edit"
              single-line
              counter
              autofocus
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.numilot" lazy persistent @save="save">
          <div>{{ props.item.numilot }}</div>
          <template v-slot:input>
            <div class="mt-3 title">numéro d'ilot</div>
          </template>
          <template v-slot:input>
            <v-text-field v-model="props.item.numilot" label="Edit" single-line counter autofocus></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">
        <v-edit-dialog :return-value.sync="props.item.numparcel" lazy persistent @save="save">
          <div>{{ props.item.numparcel }}</div>
          <template v-slot:input>
            <div class="mt-3 title">numéro de la parcelle</div>
          </template>
          <template v-slot:input>
            <v-text-field v-model="props.item.numparcel" label="Edit" single-line counter autofocus></v-text-field>
          </template>
        </v-edit-dialog>
      </td>
      <td class="text-xs-right">{{ props.item.surfgeo }}</td>
    </template>
  </v-data-table>
</template>
<script>
import _ from 'lodash';    
export default {
  name: "ParcelDetails",
  props: {
    parcel: {},
    operator: {}
  },
  data() {
    return {
      menu1: false,
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      headers: [
        // "id",
        { text: "numero bio", value: "numerobio" },
        { text: "agroforest", value: "agroforest" },
        { text: "est bio", value: "bio" },
        { text: "code culture", value: "codecultu" },
        { text: "engagement", value: "engagement" },
        { text: "maraichage", value: "maraichage" },
        { text: "numero ilot", value: "numilot" },
        { text: "numero parcelle", value: "numparcel" },
        { text: "surface géometrique", value: "surfgeo" }
      ]
    };
  },
  computed: {
    parcelData() {
      return [
        {
          numerobio: _.get(this.parcel, ["properties", "numerobio"])
            ? this.parcel.properties.numerobio
            : this.operator.numeroBio,
          agroforest: _.get(this.parcel, ["properties", "agroforest"])
            ? this.parcel.properties.agroforest
            : null,
          bio: _.get(this.parcel, ["properties", "bio"])
            ? this.parcel.properties.bio
            : "0",
          codecultu: _.get(this.parcel, ["properties", "codecultu"])
            ? this.parcel.properties.codecultu
            : null,
          engagement: _.get(this.parcel, ["properties", "engagement"])
            ? this.parcel.properties.engagement
            : this.formatDate(new Date().toISOString().substr(0, 10)),
          maraichage: _.get(this.parcel, ["properties", "maraichage"])
            ? this.parcel.properties.maraichage
            : null,
          numilot: _.get(this.parcel, ["properties", "numilot"])
            ? this.parcel.properties.numilot
            : undefined,
          numparcel: _.get(this.parcel, ["properties", "numparcel"])
            ? this.parcel.properties.numparcel
            : undefined,
          surfgeo: _.get(this.parcel, ["properties", "surfgeo"])
        }
      ];
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    save() {
      this.$emit("parcel-updated", this.parcelData);
    }
  },
  watch: {
    date() {
      this.dateFormatted = this.formatDate(this.date);
      this.parcelData.engagement = this.dateFormatted;
    }
  }
};
</script>