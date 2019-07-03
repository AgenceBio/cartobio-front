<template>
  <div class="map">
    <MglMap
      :access-token="'noToken'"
      :mapStyle.sync="mapStyle"
      :center="center"
      :zoom="zoom"
      :minZoom="0"
      :maxZoom="19"
      @load="onMapLoaded"
      ref="mapboxDiv"
    >
      <MglNavigationControl position="top-left" :showCompass="false"/>
      <MglGeolocateControl position="top-left"/>
      <MglFullscreenControl position="top-left"/>
      <MglScaleControl position="bottom-left" unit="metric"/>
    </MglMap>
  </div>
</template>

<script>
const axios = require("axios");
const _ = require("lodash");
const tilebelt = require("tilebelt");
import geojsonvt from "geojson-vt";

// mapbox-gl dependencies
import Mapbox from "mapbox-gl";
import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglFullscreenControl,
  MglScaleControl
} from "vue-mapbox";

import Navbar from "@/components/Navbar";

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
      center: [5.284125, 44.795134]
    };
  },
  props: ["bus"],
  created: function() {
    this.bus.$on("searchCompleted", this.handleSearchResult);
    this.getProfile.nom ? this.loadBioLayer() : console.log("not connected");
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    },
    mapStyle() {
      // To improve
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
        "bio-tiles",
        function(e) {
          new Mapbox.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.code_cultu)
            .addTo(this.map);
        }.bind(this)
      );
    },
    handleSearchResult(value) {
      this.map.panTo(value.geometry.coordinates);
    },
    loadBioLayer() {
      console.log(this.getProfile);
      console.log("logged in, we can load bio layer");
    }
  }
};
</script>

<style lang="scss" scoped>
.map {
  top: 64px;
  height: calc(100vh - 64px);
  width: 100%;
  position: relative;
}
</style>
