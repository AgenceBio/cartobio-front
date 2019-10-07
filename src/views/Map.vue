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
      <ParcelsList :parcels.sync="parcelsOperator" v-if="drawer && !mini"></ParcelsList>
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
          <MglFullscreenControl position="top-left" />
          <MglScaleControl position="bottom-left" unit="metric" />
        </MglMap>
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
import SphericalMercator from "sphericalmercator";

import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglFullscreenControl,
  MglScaleControl
} from "vue-mapbox";

import Navbar from "@/components/Navbar";
import ParcelsList from "@/components/ParcelsList";

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
  console.log(x, y, z);
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
    "fill-color": "yellow",
    "fill-outline-color": "rgba(200, 100, 240, 1)",
    "fill-opacity": 0.6
  },
  tms: true,
  maxzoom: 19
};

export default {
  name: "Map",
  components: {
    Navbar,
    ParcelsList,
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
      center: undefined,
      operator: {},
      parcelsOperator: {},
      bboxOperator: [],
      mini: true,
      drawer: false
    };
  },
  props: ["bus"],
  created: function() {
    this.bus.$on("searchCompleted", this.handleSearchResult);
    this.operator = this.getOperator;
    this.center = [5.150809, 44.688729];
    this.drawer = _.get(this.$store.getters.getOperator, "title");
    if (this.operator) {
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
            : console.log("source already exists");
          !this.map.getLayer("bio-tiles")
            ? this.map.addLayer(bioLayer)
            : console.log("layer already exists");
        } else if (this.map.getLayer("bio-tiles")) {
          this.map.removeLayer(bioLayer.id);
          this.map.removeSource("bio-tiles");
        }

        if (this.parcelsOperator && !this.map.getLayer("operator-parcels")) {
          this.map.addLayer({
            id: "operator-parcels",
            type: "fill",
            source: {
              data: this.parcelsOperator,
              type: "geojson"
            },
            paint: {
              "fill-color": "red",
              "fill-outline-color": "rgba(100, 200, 240, 1)",
              "fill-opacity": 0.6
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
      this.map.on(
        "click",
        "collabio",
        function(e) {
          console.log(e.features);
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
          console.log(e.features);
          new Mapbox.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.codecultu)
            .addTo(this.map);
        }.bind(this)
      );
      // this.map.on(
      //   "click",
      //   "bio-tiles",
      //   function(e) {
      //     console.log(e.features);
      //     new Mapbox.Popup()
      //       .setLngLat(e.lngLat)
      //       .setHTML(e.features[0].properties.code_cultu)
      //       .addTo(this.map);
      //   }.bind(this)
      // );
      console.log(this.bboxOperator);
      if (this.bboxOperator) {
        this.map.fitBounds(this.bboxOperator, {
          padding: { top: 10, bottom: 25, left: 15, right: 5 }
        });
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
        console.log(url, resourceType);
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
        console.log(bbox);
        newUrl = newUrl.split("TILEMATRIX")[0];
        newUrl += "bbox=" + bbox.toString() + ",WGS84";
        console.log(newUrl);
      }
      return { url: newUrl };
    },
    loadBioLayer() {
      // this.connectEspaceCollaboratif().then(function(data) {
      //   console.log(data);
      // });
      console.log(this.getProfile);
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
      console.log(turf.bbox(data));
      this.bboxOperator = turf.bbox(data);
    },
    getCenter() {
      let defaultCenter = [5.150809, 44.688729];
      console.log("center here");
      console.log(this.parcelsOperator);
      let center = _.get(this.parcelsOperator, "features")
        ? // ? _.get(
          //     turf.center(this.parcelsOperator),
          //     ["geometry", "coordinates"],
          //     defaultCenter
          //   )
          turf.center(this.parcelsOperator)
        : defaultCenter;
      console.log(center);
      this.map.panTo(center);
      return center;
    },
    getParcelsCenter(parcels) {
      console.log(parcels);
      var features = turf.featureCollection([parcels.features]);

      console.log(turf.center(features));
      return [5.150809, 44.688729];
    }
  }
};
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
