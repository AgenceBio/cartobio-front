<template>
  <v-layout>
    <v-navigation-drawer
      app
      clipped
      stateless
      hide-overlay
      v-model="drawer"
      :mini-variant.sync="mini"
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile>
            <v-icon>view_list</v-icon>
            <v-btn icon v-if="mini">
              <v-icon>chevron_right</v-icon>
            </v-btn>
            <v-list-tile-content>
              <v-list-tile-title>Liste des Parcelles</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon @click.stop="mini = !mini" align-end>
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <ParcelsList
        :parcels.sync="parcelsOperator"
        v-if="drawer && !mini"
        v-on:hover-parcel="hoverParcel($event)"
        v-on:stop-hovering="stopHovering($event)"
        v-on:hover-ilot="hoverIlot($event)"
        v-on:stop-hovering-ilot="stopHovering($event)"
        v-on:select-parcel="selectParcel($event)"
        v-on:select-all-parcels="selectAllParcels($event)"
      ></ParcelsList>
    </v-navigation-drawer>
    <v-content app>
      <div class="map">
        <v-dialog v-model="getDisclaimer" persistent max-width="500">
          <v-card>
            <v-card-title class="headline"></v-card-title>
            <v-card-text>Application en cours de développement. Données non exhaustives.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" flat @click="acknowledgeDisclaimer()">J'ai compris</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="setUpParcel" persistent v-if="operator.title">
          <v-card>
            <v-card-title class="headline">Nouvelle Parcelle - {{this.operator.title}}</v-card-title>
            <v-card-text>
              <ParcelDetails
                :operator="operator"
                :parcel.sync="newParcel"
                v-on:parcel-updated="updateNewParcel($event)"
              ></ParcelDetails>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" flat @click="saveParcel()">Valider</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <MglMap
          :access-token="'noToken'"
          :mapStyle.sync="mapStyle"
          :center="center"
          :zoom="zoom"
          :minZoom="0"
          :maxZoom="19"
          @load="onMapLoaded"
          ref="mapboxDiv"
          :transformRequest="transformRequest"
        >
          <MglNavigationControl position="top-left" :showCompass="false" />
          <MglGeolocateControl position="top-left" />
          <MglScaleControl position="bottom-left" unit="metric" />
        </MglMap>
        <SelectedParcelsDetails
          class="data-card"
          v-if="selectedParcels.features.length"
          :selectedParcels.sync="selectedParcels.features"
        ></SelectedParcelsDetails>
      </div>
    </v-content>
  </v-layout>
</template>

<script>
const axios = require("axios");
const _ = require("lodash");
const tilebelt = require("tilebelt");
const turf = require("turf");

import geojsonvt from "geojson-vt";

// mapbox-gl dependencies
import Mapbox from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import SphericalMercator from "sphericalmercator";
// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglFullscreenControl,
  MglScaleControl
} from "vue-mapbox";

import Navbar from "@/components/Navbar";
import ParcelsList from "@/components/ParcelsList";
import SelectedParcelsDetails from "@/components/SelectedParcelsDetails";
import ParcelDetails from "@/components/ParcelDetails";

let mercator = new SphericalMercator({
  size: 256
});

let mapStyle = {
  version: 8,
  sources: {
    "simple-tiles": {
      type: "raster",
      tiles: [
        "https://wxs.ign.fr/" +
          process.env.VUE_APP_API_IGN +
          "/geoportail/wmts?" +
          "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
          "&STYLE=normal" +
          "&TILEMATRIXSET=PM" +
          "&FORMAT=image/jpeg" +
          "&LAYER=ORTHOIMAGERY.ORTHOPHOTOS" +
          "&TILEMATRIX={z}" +
          "&TILEROW={y}" +
          "&TILECOL={x}"
      ],
      opacity: "1",
      attribution: "IGN-F/Géoportail",
      tileSize: 256
    },
    "other-tiles": {
      type: "raster",
      tiles: [
        "https://wxs.ign.fr/" +
          process.env.VUE_APP_API_IGN +
          "/geoportail/wmts?" +
          "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
          "&STYLE=bdparcellaire" +
          "&TILEMATRIXSET=PM" +
          "&FORMAT=image/png" +
          "&LAYER=CADASTRALPARCELS.PARCELS" +
          "&TILEMATRIX={z}" +
          "&TILEROW={y}" +
          "&TILECOL={x}"
      ],
      opacity: "1",
      attribution: "IGN-F/Géoportail",
      tileSize: 256
    }
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "simple-tiles",
      minzoom: 0,
      maxzoom: 19
    },
    {
      id: "other-tiles",
      type: "raster",
      source: "other-tiles",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

let bioSource = {
  type: "vector",
  scheme: "tms",
  tiles: [process.env.VUE_APP_GEOSERVER_ADDR]
};

let calculateBbox = function(x, y, z) {
  // console.log(x, y, z);
};

let espaceCollabSource = {
  type: "vector",
  tiles: [
    "https://espacecollaboratif.ign.fr/gcms/wfs/cartobio?service=WFS&version=1.1.0&request=GetFeature&outputFormat=GeoJSON&typeName=rpgbio2018dromewgs84" +
      "&srsname=4326" +
      "&TILEMATRIX={z}" +
      "&TILEROW={y}" +
      "&TILECOL={x}"
  ]
};

let layerCollab = {
  id: "collabio",
  type: "fill",
  source: espaceCollabSource,
  "source-layer": "rpgbio2018dromewgs84",
  paint: {
    "fill-color": "yellow",
    "fill-outline-color": "rgba(200, 100, 240, 1)",
    "fill-opacity": 0.6
  }
};

let bioLayer = {
  id: "bio-tiles",
  type: "fill",
  source: "bio-tiles",
  "source-layer": "RPGDROMEANO2018",
  minzoom: 0,
  paint: {
    "fill-color": "#D0D32E",
    "fill-outline-color": "#83C2AB",
    "fill-opacity": 0.6
  },
  tms: true,
  maxzoom: 19
};
let draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  }
});

// map.addControl(draw);

// map.on('draw.create', updateArea);
// map.on('draw.delete', updateArea);
// map.on('draw.update', updateArea);

export default {
  name: "Map",
  components: {
    Navbar,
    ParcelsList,
    SelectedParcelsDetails,
    ParcelDetails,
    MglNavigationControl,
    MglGeolocateControl,
    MglFullscreenControl,
    MglScaleControl,
    MglMap
  },
  data() {
    return {
      map: undefined,
      zoom: 12,
      mapPadding: { top: 10, bottom: 25, left: 15, right: 5 },
      center: undefined,
      operator: {},
      parcelsOperator: { features: [], type: "FeatureCollection" },
      highlightedParcels: { features: [], type: "FeatureCollection" },
      selectedParcels: { features: [], type: "FeatureCollection" },
      newParcel: {},
      bboxOperator: [],
      popupParcel: new Mapbox.Popup({
        closeButton: false
      }),
      popupSelectedParcels: new Mapbox.Popup({
        closeButton: true
      }),
      mini: true,
      drawer: false,
      setUpParcel: false
    };
  },
  props: ["bus"],
  created: function() {
    this.bus.$on("searchCompleted", this.handleSearchResult);
    this.operator = this.getOperator;
    this.center = [5.150809, 44.688729];
    this.drawer = _.get(this.$store.getters.getOperator, "title");

    if (_.get(this.operator, "numeroBio")) {
      // Doc : https://espacecollaboratif.ign.fr/api/doc/transaction
      // mongoDB filter and not standard WFS filter.
      let params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "GeoJSON",
        typeName: "rpgbio2019drome",
        srsname: "4326",
        filter: '{"numerobio":' + this.operator.numeroBio + "}"
      };
      axios
        .get("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio", {
          params: params
        })
        .then(data => this.displayOperatorLayer(data.data));
    }
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    },
    getOperator() {
      return this.$store.getters.getOperator;
    },
    getDisclaimer() {
      return this.$store.getters.getDisclaimer;
    },
    mapStyle() {
      // To improve
      // should not be in computed style. computed style should work for displaying/hiding layers already defined and editing their sources.
      let computedMapStyle = mapStyle;
      if (this.map) {
        if (this.getProfile.nom) {
          !this.map.getSource("bio-tiles")
            ? this.map.addSource("bio-tiles", bioSource)
            : null;
          !this.map.getLayer("bio-tiles") ? this.map.addLayer(bioLayer) : null;
        } else if (this.map.getLayer("bio-tiles")) {
          this.map.removeLayer(bioLayer.id);
          this.map.removeSource("bio-tiles");
        }

        if (this.parcelsOperator && !this.map.getLayer("operator-parcels")) {
          this.map.addLayer({
            id: "operator-parcels",
            type: "fill",
            source: "operatorParcels",
            paint: {
              "fill-color": [
                "match",
                ["get", "bio"],
                "0",
                "#F4869D",
                "1",
                "#0D9BA5",
                "white"
              ],
              "fill-outline-color": "rgba(100, 200, 240, 1)",
              "fill-opacity": 0.8
            }
          });
        }

        if (!this.map.getLayer("highlighted-parcels")) {
          this.map.addLayer({
            id: "highlighted-parcels",
            type: "fill",
            source: "highlight",
            paint: {
              "fill-color": [
                "match",
                ["get", "bio"],
                "0",
                "#6F3D48",
                "1",
                "#06474B",
                "white"
              ],
              "fill-outline-color": "rgba(100, 200, 240, 1)",
              "fill-opacity": 1
            }
          });
        }
        if (
          _.get(this.selectedParcels, ["features", "length"]) &&
          !this.map.getLayer("selected-parcels")
        ) {
          this.map.addLayer({
            id: "selected-parcels",
            type: "fill",
            source: "selected",
            paint: {
              "fill-color": [
                "match",
                ["get", "bio"],
                "0",
                "#9C5664",
                "1",
                "#09636A",
                "white"
              ],
              "fill-outline-color": "rgba(100, 200, 240, 1)",
              "fill-opacity": 1
            }
          });
        }
      }
      return computedMapStyle;
    }
  },
  methods: {
    onMapLoaded(event) {
      this.map = event.map;
      // let bounds = this.map.getBounds();
      this.map.addSource("bio-tiles", bioSource);
      this.map.addSource("selected", {
        type: "geojson",
        data: this.selectedParcels
      });
      this.map.addSource("highlight", {
        type: "geojson",
        data: this.highlightedParcels
      });
      this.map.addSource("operatorParcels", {
        type: "geojson",
        data: this.parcelsOperator
      });
      this.map.on(
        "click",
        "collabio",
        function(e) {
          new Mapbox.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.code_cultu)
            .addTo(this.map);
        }.bind(this)
      );
      this.map.on(
        "click",
        "other-tiles",
        function(e) {
          new Mapbox.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.code_cultu)
            .addTo(this.map);
        }.bind(this)
      );

      this.map.on(
        "click",
        "operator-parcels",
        function(e) {
          this.selectParcel(e.features[0]);
          // new Mapbox.Popup()
          //   .setLngLat(e.lngLat)
          //   .setHTML(
          //     "<span>" +
          //       e.features[0].properties.codecultu +
          //       "</span><br/>" +
          //       "<span>" +
          //       e.features[0].properties.numilot +
          //       "</span><br/>" +
          //       "<span>" +
          //       e.features[0].properties.numparcel +
          //       "</span>"
          //   )
          //   .addTo(this.map);
        }.bind(this)
      );
      if (this.operator && this.bboxOperator[0] !== Infinity) {
        this.map.fitBounds(this.bboxOperator, {
          padding: this.mapPadding
        });
      }
      if (this.operator) {
        this.map.addControl(draw, "top-right");
        // draw.changeMode("draw_polygon");
        this.map.on(
          "draw.create",
          function(e) {
            let newFeature = e.features[0];
            let surface = turf.area(newFeature);
            surface = Math.round(surface * 100) / 100; // round to 2 decimals
            newFeature.properties.surfgeo = surface;
            this.newParcel = newFeature;
            this.setUpParcel = true;
          }.bind(this)
        );
        this.map.on("draw.delete", updateArea);
        this.map.on("draw.update", updateArea);
        this.$forceUpdate();
      }
      function updateArea(e) {
        var data = draw.getAll();
        // var answer = document.getElementById("calculated-area");
        if (data.features.length > 0) {
          var area = turf.area(data);
          // restrict to area to 2 decimal points
          var rounded_area = Math.round(area * 100) / 100;
          // answer.innerHTML =
          //   "<p><strong>" +
          //   rounded_area +
          //   "</strong></p><p>square meters</p>";
        } else {
          // answer.innerHTML = "";
          if (e.type !== "draw.delete")
            alert("Use the draw tools to draw a polygon!");
        }
      }
    },
    handleSearchResult(value) {
      this.map.panTo(value.geometry.coordinates);
    },
    transformRequest(url, resourceType) {
      // not used currently
      let newUrl = url;
      if (
        resourceType === "Tile" &&
        url.startsWith("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio")
      ) {
        let paramArr = [];
        _.forEach(url.split("&"), function(param) {
          let subparam = param.split("=");
          paramArr.push(subparam);
        });
        let args = _.fromPairs(paramArr);
        let zoom = args.TILEMATRIX; // z
        let row = args.TILEROW; // y
        let col = args.TILECOL; // x
        let bbox = mercator.bbox(col, row, zoom, true, "4326");
        newUrl = newUrl.split("TILEMATRIX")[0];
        newUrl += "bbox=" + bbox.toString() + ",WGS84";
      }
      return { url: newUrl };
    },
    loadBioLayer() {
      // this.connectEspaceCollaboratif().then(function(data) {
      //   console.log(data);
      // });
      // console.log(this.getProfile);
      console.log("logged in, we can load bio layer");
    },
    // connectEspaceCollaboratif() {
    //   let params = {
    //     "gcms_user_login[username_email]": "",
    //     "gcms_user_login[password]": "",
    //     _submit: "Connexion"
    //   };
    //   axios
    //     .post("http://espacecollaboratif.ign.fr", params)
    //     .then(data => console.log(data));
    // },
    acknowledgeDisclaimer() {
      this.$store.commit("setDisclaimer", false);
    },
    displayOperatorLayer(data) {
      this.parcelsOperator = data;
      this.bboxOperator = turf.bbox(data);
      if (this.map) {
        this.map.addControl(draw, "top-right");
        // draw.changeMode("draw_polygon");
        this.map.on(
          "draw.create",
          "draw.create",
          function(e) {
            let newFeature = e.features[0];
            let surface = turf.area(newFeature);
            surface = Math.round(surface * 100) / 100; // round to 2 decimals
            newFeature.properties.surfgeo = surface;
            this.newParcel = newFeature;
            this.setUpParcel = true;
          }.bind(this)
        );
        this.map.on("draw.delete", updateArea);
        this.map.on("draw.update", updateArea);
        if (_.get(this.bboxOperator, "0")) {
          this.map.getSource("operatorParcels").setData(this.parcelsOperator);
          this.map.fitBounds(this.bboxOperator, {
            padding: this.mapPadding
          });
        }
      }
      function updateArea(e) {
        var data = draw.getAll();
        // var answer = document.getElementById("calculated-area");
        if (data.features.length > 0) {
          var area = turf.area(data);
          // restrict to area to 2 decimal points
          var rounded_area = Math.round(area * 100) / 100;
          // answer.innerHTML =
          //   "<p><strong>" +
          //   rounded_area +
          //   "</strong></p><p>square meters</p>";
        } else {
          // answer.innerHTML = "";
          if (e.type !== "draw.delete")
            alert("Use the draw tools to draw a polygon!");
        }
      }
    },
    hoverParcel(parcel) {
      this.highlightedParcels = {
        features: [parcel],
        type: "FeatureCollection"
      };
      // console.log(turf.center(this.highlightedParcels).geometry.coordinates);
      this.map.getSource("highlight").setData(this.highlightedParcels);
      this.popupParcel
        .setLngLat(turf.center(this.highlightedParcels).geometry.coordinates)
        .setHTML(parcel.properties.codecultu)
        .addTo(this.map);
    },
    stopHovering(parcel) {
      this.highlightedParcels = {
        features: [],
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
      this.popupParcel.remove();
    },
    hoverIlot(ilot) {
      this.highlightedParcels = {
        features: ilot.parcels,
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
    },
    selectParcel(parcel) {
      let tmp = _.find(this.parcelsOperator.features, function(feature) {
        return feature.id === parcel.id;
      });
      tmp.properties.selected = !tmp.properties.selected;
      if (tmp.properties.selected) {
        this.selectedParcels.features.push(tmp);
      } else {
        // _.remove doesn't trigger component updates
        // https://stackoverflow.com/questions/42090651/computed-properties-not-updating-when-using-lodash-and-vuejs
        this.selectedParcels.features = _.filter(
          this.selectedParcels.features,
          function(feature) {
            return feature.id !== tmp.id;
          }
        );
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    selectAllParcels(bool) {
      _.forEach(this.parcelsOperator.features, function(parcel) {
        parcel.properties.selected = bool;
      });
      if (bool) {
        this.selectedParcels.features = this.parcelsOperator.features;
      } else {
        this.selectedParcels.features = [];
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    saveParcel() {
      this.setUpParcel = !this.setUpParcel;
      this.parcelsOperator.features.push(this.newParcel);
    },
    updateNewParcel(newData) {
      this.newParcel.properties = newData[0];
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
.map {
  height: 100%;
  width: 100%;
  position: relative;
}
.data-card {
  position: absolute;
  top: 10px;
  margin-left: 54px;
}
</style>
