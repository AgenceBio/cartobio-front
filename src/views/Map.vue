<template>
  <v-layout>
    <!-- Left drawer for parcels list -->
    <v-navigation-drawer
      app
      clipped
      stateless
      hide-overlay
      v-model="drawer"
      :mini-variant.sync="mini"
    >
      <!-- Header -->
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

      <!-- Parcels List -->
      <ParcelsList
        :parcels.sync="parcelsOperator[2019]"
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
      <!-- Map division so it takes the full width/height left -->
      <div class="map">
        <!-- Disclaimer dialog. May be useless once in prod -->
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

        <!-- Map component -->
        <MglMap
          :access-token="'noToken'"
          :mapStyle.sync="mapStyle"
          :center="center"
          :zoom="zoom"
          :minZoom="0"
          :maxZoom="24"
          @load="onMapLoaded"
          ref="mapboxDiv"
          :transformRequest="transformRequest"
        >
          <MglNavigationControl position="top-left" :showCompass="false" />
          <MglGeolocateControl position="top-left" />
          <MglScaleControl position="bottom-left" unit="metric" />
        </MglMap>

        <!-- Card with Aggregated parcels details - maybe a bit more infography would be awesome -->
        <SelectedParcelsDetails
          class="data-card"
          v-if="selectedParcels.features.length"
          :selectedParcels.sync="selectedParcels.features"
        ></SelectedParcelsDetails>

        <!-- Layers selector -->
        <v-card class="layers-card" v-show="showLayersCard">
          <v-list class="pt-0" dense>
            <!-- List of years with parcels from the operator -->
            <v-list-tile v-for="(year, index) in years" :key="index">
              <v-list-tile-action>
                <v-btn icon @click="toggleLayerAnon(year)">
                  <v-icon v-if="layersVisible['anon' + year]">visibility</v-icon>
                  <v-icon v-if="!layersVisible['anon' + year]">visibility_off</v-icon>
                </v-btn>
              </v-list-tile-action>
              Couche Bio {{year}}
            </v-list-tile>
          </v-list>
          <v-list class="pt-0" dense v-if="operator.title">
            <!-- List of years with parcels from the operator -->
            <v-list-tile v-for="(year, index) in years" :key="index">
              <v-list-tile-action>
                <v-btn icon @click="toggleLayer(year)">
                  <v-icon v-if="layersVisible[year]">visibility</v-icon>
                  <v-icon v-if="!layersVisible[year]">visibility_off</v-icon>
                </v-btn>
              </v-list-tile-action>
              Parcelles {{year}}
            </v-list-tile>
          </v-list>
        </v-card>
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

// map style. is it used ?
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
      maxzoom: 24
    },
    {
      id: "other-tiles",
      type: "raster",
      source: "other-tiles",
      minzoom: 0,
      maxzoom: 24
    }
  ]
};

// // 2019 anonymous bio layer
// let bioLayer = {
//   id: "bio-tiles",
//   type: "fill",
//   source: "bio-tiles",
//   "source-layer": "anon_rpgbio_2019",
//   minzoom: 0,
//   paint: {
//     "fill-color": "#D0D32E",
//     "fill-outline-color": "#83C2AB",
//     "fill-opacity": 0.6
//   },
//   tms: true,
//   maxzoom: 24
// };

// Mapbox draw control
let draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  }
});

// template for geoJSON objects
let geoJsonTemplate = { features: [], type: "FeatureCollection" };

let tokenCollab = btoa(
  process.env.VUE_APP_ESPACE_COLLAB_LOGIN +
    ":" +
    process.env.VUE_APP_ESPACE_COLLAB_PASSWORD
);
console.log(tokenCollab);

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
      // map related data:

      map: undefined,
      zoom: 12,
      mapPadding: { top: 10, bottom: 25, left: 15, right: 5 },
      center: [5.150809, 44.688729],
      // anonymous layers
      anonLayers: {},
      // current operator data
      operator: {},
      // operator parcels by year
      parcelsOperator: {
        2019: geoJsonTemplate,
        2018: geoJsonTemplate,
        2017: geoJsonTemplate
      },
      // highlighted parcels (hovered in list)
      highlightedParcels: geoJsonTemplate,
      // selected parcels
      selectedParcels: geoJsonTemplate,
      // placeholder for newly drawn parcel
      newParcel: {},
      // bbox containing operator parcels
      bboxOperator: [],
      // popup with short parcel infos
      popupParcel: new Mapbox.Popup({
        closeButton: false
      }),
      // popup with agregated parcels infos
      popupSelectedParcels: new Mapbox.Popup({
        closeButton: true
      }),
      // placeholder for layers for an operator
      layersOperator: {},

      // display related data

      // show drawer
      drawer: false,
      // mini drawer display
      mini: true,

      // misc data

      // new parcel dialog
      setUpParcel: false,
      showLayersCard: false,
      layersVisible: {
        2019: false,
        2018: false,
        2017: false,
        anon2019: false,
        anon2018: false,
        anon2017: false
      },
      // list of years in CartoBio. Need to find a more automated way to get this for the future.
      // Also indirect impact on layersVisible and parcelsOperator
      years: [2019, 2018, 2017]
    };
  },
  // event bus
  props: ["bus"],
  created: function() {
    // handle geosearch result
    this.bus.$on("searchCompleted", this.handleSearchResult);
    // get the current operator
    this.operator = this.getOperator;

    // if there is an operator, show drawer.
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
      console.log(params);
      // this.connectEspaceCollaboratif().then(
      // function() {
      // get 2019 parcels from the operator
      axios
        .get("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio", {
          params: params,
          headers: {
            Authorization: "Basic " + tokenCollab
          }
        })
        .then(data => this.displayOperatorLayer(data.data));

      // get 2018 parcels from the operator
      let params2018 = params;
      params2018.typeName = "rpgbio2018drome";
      axios
        .get("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio", {
          params: params2018,
          headers: {
            Authorization: "Basic " + tokenCollab
          }
        })
        .then(data => this.addOperatorData(data.data, "2018"));

      // get 2017 parcels from the operator
      let params2017 = params;
      params2017.typeName = "rpgbio2017drome";
      axios
        .get("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio", {
          params: params2017,
          headers: {
            Authorization: "Basic " + tokenCollab
          }
        })
        .then(data => this.addOperatorData(data.data, "2017"));
      // }.bind(this)
      // );
      // store the layers
      // maybe in future evolutions: let user choose the color of the layers so we don't have to handle it ourselves for lager set of years.
      // maybe a loop to do it but need to store colors for each
      this.layersOperator["2019"] = this.getYearLayer(
        "2019",
        "#0B7F88", // bio
        "#C86E81", // not bio
        "#004462" // outline
      );
      this.layersOperator["2018"] = this.getYearLayer(
        "2018",
        "#0D9BA5", // bio
        "#F4869D", // not bio
        "#005377" // outline
      );
      this.layersOperator["2017"] = this.getYearLayer(
        "2017",
        "#39ADB5", // bio
        "#F69CAE", // not bio
        "#2E728F" // outline
      );
    }
  },
  computed: {
    // user profile
    getProfile() {
      return this.$store.getters.getProfile;
    },
    // current operator
    getOperator() {
      return this.$store.getters.getOperator;
    },
    // display disclaimer on load ?
    getDisclaimer() {
      return this.$store.getters.getDisclaimer;
    },
    // stored layers (? wtf did I wanted to do with that)
    sortedLayers() {
      return;
    },
    // map Style
    mapStyle() {
      // To improve
      // should not be in computed style. computed style should work for displaying/hiding layers already defined and editing their sources.
      let computedMapStyle = mapStyle;
      return computedMapStyle;
    }
  },
  methods: {
    onMapLoaded(event) {
      this.map = event.map;
      // add map sources
      // this.map.addSource("bio-tiles", bioSource);
      if (this.getProfile.active) {
        this.loadLayers();
      }
      // this.map.on(
      //   "click",
      //   "collabio",
      //   function(e) {
      //     new Mapbox.Popup()
      //       .setLngLat(e.lngLat)
      //       .setHTML(e.features[0].properties.code_cultu)
      //       .addTo(this.map);
      //   }.bind(this)
      // );

      // this.map.on(
      //   "click",
      //   "other-tiles",
      //   function(e) {
      //     new Mapbox.Popup()
      //       .setLngLat(e.lngLat)
      //       .setHTML(e.features[0].properties.code_cultu)
      //       .addTo(this.map);
      //   }.bind(this)
      // );

      // handle click on layers
      this.map.on(
        "click",
        "operator-parcels-2019",
        function(e) {
          this.selectParcel(e.features[0]);
        }.bind(this)
      );
      if (this.operator.title && !this.isOperatorOnMap) {
        console.log("here?");
        if (this.layersVisible[2019]) {
          this.map.addLayer(this.layersOperator[2019]);
        }
        this.setUpMapOperator();
      }
    },
    loadLayers() {
      this.showLayersCard = true;
      _.forEach(
        this.years,
        function(year) {
          // bio source
          let bioSource = {
            type: "vector",
            scheme: "tms",
            tiles: [
              process.env.VUE_APP_GEOSERVER_PREFIX +
                "" +
                year +
                process.env.VUE_APP_GEOSERVER_SUFFIX
            ]
          };
          // security to not trigger map errors
          if (!this.map.getSource("bio-" + year)) {
            this.map.addSource("bio-" + year, bioSource);
          }
          let bioLayer = {
            id: "bio-tiles-" + year,
            type: "fill",
            source: "bio-" + year,
            "source-layer": "anon_rpgbio_" + year,
            minzoom: 0,
            paint: {
              "fill-color": "#D0D32E",
              "fill-outline-color": "#83C2AB",
              "fill-opacity": 0.6
            },
            tms: true,
            maxzoom: 24
          };
          this.anonLayers[year] = bioLayer;
        }.bind(this)
      );

      this.toggleLayerAnon(2019);

      if (!this.map.getSource("selected")) {
        this.map.addSource("selected", {
          type: "geojson",
          data: this.selectedParcels
        });
      }
      if (!this.map.getSource("highlight")) {
        this.map.addSource("highlight", {
          type: "geojson",
          data: this.highlightedParcels
        });
      }
      if (!this.map.getSource("operatorParcels2019")) {
        this.map.addSource("operatorParcels2019", {
          type: "geojson",
          data: this.parcelsOperator[2019]
        });
      }

      if (!this.map.getSource("operatorParcels2018")) {
        this.map.addSource("operatorParcels2018", {
          type: "geojson",
          data: this.parcelsOperator[2018]
        });
      }
      if (!this.map.getSource("operatorParcels2017")) {
        this.map.addSource("operatorParcels2017", {
          type: "geojson",
          data: this.parcelsOperator[2017]
        });
      }
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
    },
    removeLayers() {
      // TODO
      console.log(this.map);
    },
    handleSearchResult(value) {
      this.map.panTo(value.geometry.coordinates);
    },
    // not used currently
    transformRequest(url, resourceType) {
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
    connectEspaceCollaboratif() {
      let params = {
        "gcms_user_login[username_email]":
          process.env.VUE_APP_ESPACE_COLLAB_LOGIN,
        "gcms_user_login[password]": process.env.VUE_APP_ESPACE_COLLAB_PASSWORD,
        _submit: "Connexion"
      };
      return axios
        .post("http://espacecollaboratif.ign.fr/login", params)
        .then();
    },
    acknowledgeDisclaimer() {
      this.$store.commit("setDisclaimer", false);
    },
    displayOperatorLayer(data) {
      this.addOperatorData(data, "2019");
      this.toggleLayer("2019");
      this.bboxOperator = turf.bbox(data);
      if (this.map && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }
    },
    // function  used by draw features
    updateArea(e) {
      var data = draw.getAll();
      if (data.features.length > 0) {
        var area = turf.area(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
      } else {
        if (e.type !== "draw.delete")
          alert("Use the draw tools to draw a polygon!");
      }
    },
    setUpMapOperator() {
      console.log("setup map operator");
      this.map.addControl(draw, "top-right");
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
      this.map.on("draw.delete", this.updateArea);
      this.map.on("draw.update", this.updateArea);
      if (
        this.bboxOperator[0] !== undefined &&
        this.bboxOperator[0] !== Infinity
      ) {
        console.log("fit bounds");
        this.map.fitBounds(this.bboxOperator, {
          padding: this.mapPadding
        });
      }
      this.isOperatorOnMap = true;
      this.$forceUpdate();
    },
    hoverParcel(parcel) {
      this.highlightedParcels = {
        features: [parcel],
        type: "FeatureCollection"
      };
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
      let tmp = _.find(this.parcelsOperator[2019].features, function(feature) {
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
      _.forEach(this.parcelsOperator[2019].features, function(parcel) {
        parcel.properties.selected = bool;
      });
      if (bool) {
        this.selectedParcels.features = this.parcelsOperator[2019].features;
      } else {
        this.selectedParcels.features = [];
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    saveParcel() {
      this.setUpParcel = !this.setUpParcel;
      this.parcelsOperator[2019].features.push(this.newParcel);
    },
    updateNewParcel(newData) {
      this.newParcel.properties = newData[0];
      this.$forceUpdate();
    },
    addOperatorLayer(data, year) {
      this.parcelsOperator[year] = data;
      this.layersVisible[year] = false;
    },
    addOperatorData(data, year) {
      this.parcelsOperator[year] = data;
      if (this.map) {
        this.map
          .getSource("operatorParcels" + year)
          .setData(this.parcelsOperator[year]);
      }
    },
    toggleLayer(layerYear) {
      let layer = this.layersOperator[layerYear];
      this.layersVisible[layerYear] = !this.layersVisible[layerYear];
      if (this.map) {
        if (this.map.getLayer(layer.id)) {
          this.map.removeLayer(layer.id);
        } else {
          this.map.addLayer(layer);
        }
      }
      this.$forceUpdate();
    },
    toggleLayerAnon(layerYear) {
      let layer = this.anonLayers[layerYear];
      this.layersVisible["anon" + layerYear] = !this.layersVisible[
        "anon" + layerYear
      ];
      if (this.map) {
        if (this.map.getLayer(layer.id)) {
          this.map.removeLayer(layer.id);
        } else {
          this.map.addLayer(layer);
        }
      }
      this.$forceUpdate();
    },
    // annual parcel layer
    getYearLayer(layerYear, colorBio, colorNoBio, fillColor) {
      return {
        id: "operator-parcels-" + layerYear,
        type: "fill",
        source: "operatorParcels" + layerYear,
        paint: {
          "fill-color": [
            "match",
            ["get", "bio"],
            "0",
            colorNoBio,
            "1",
            colorBio,
            "white"
          ],
          "fill-outline-color": fillColor,
          "fill-opacity": 0.8
        }
      };
    }
  },
  watch: {
    // whenever question changes, this function will run
    getProfile: function(newProfile, oldProfile) {
      if (newProfile.active) {
        this.loadLayers();
      } else {
        this.removeLayers();
      }
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
.layers-card {
  position: absolute;
  top: 80px;
  right: 10px;
}
</style>
