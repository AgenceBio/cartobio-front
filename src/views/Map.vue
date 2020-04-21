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
        :parcels.sync="parcelsOperator[this.currentYear]"
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
          :mapStyle="mapStyle"
          :center="center"
          :zoom="zoom"
          :minZoom="0"
          :maxZoom="24"
          @load="onMapLoaded"
          ref="mapboxDiv"
        >
          <v-toolbar floating dense class="my-3 toolbar-search">
            <Geosearch @searchCompleted="handleSearchResult"></Geosearch>
          </v-toolbar>
          <MglNavigationControl position="top-left" :showCompass="false" />
          <MglGeolocateControl position="top-left" />
          <MglScaleControl position="bottom-left" unit="metric" />
          <ParcelDetailsPopup :features="hoveredParcelFeatures" />

          <MglVectorLayer v-for="(layer) in vectorLayers"
            :key="layer.id"
            before="water-name-lakeline"
            :sourceId="layer.source"
            :layerId="layer.id"
            :layer="layer" />

          <MglGeojsonLayer v-for="(layer) in geojsonLayers"
            :key="layer.id"
            before="water-name-lakeline"
            :sourceId="layer.source"
            :layerId="layer.id"
            :layer="layer" />
        </MglMap>

        <!-- Card with Aggregated parcels details - maybe a bit more infography would be awesome -->
        <SelectedParcelsDetails
          class="data-card"
          v-if="selectedParcels.features.length"
          :selectedParcels.sync="selectedParcels.features"
        ></SelectedParcelsDetails>

        <!-- Layers selector -->
        <v-flex class="layers-panel" v-show="showLayersCard">
          <v-expansion-panel popout expand v-bind:value="expandLayers">
            <v-expansion-panel-content>
              <template v-slot:header>
                <div class="expansion-title">
                  <v-icon class="mr-2">layers</v-icon> Calques
                </div>
              </template>
              <v-card>
                <v-list dense class="pt-0" v-if="operator.title">
                  <v-list-tile subheader>
                    <v-subheader>{{ operator.title }}</v-subheader>
                  </v-list-tile>
                  <!-- List of years with parcels from the operator -->
                  <v-list-tile v-for="(layerName) in operatorLayers" :key="layerName">
                    <v-list-tile-action>
                      <v-switch v-model="layersVisibility[layerName]" />
                    </v-list-tile-action>
                    <v-list-tile-content @click.prevent="layersVisibility[layerName] != layersVisibility[layerName]">
                      {{layerName}}
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>

                <v-divider></v-divider>

                <v-list-tile>
                  <v-subheader>Registre Parcellaire Graphique Bio</v-subheader>
                </v-list-tile>

                <v-list class="pt-0" dense>
                  <!-- List of years with parcels from the operator -->
                  <v-list-tile v-for="(sourceId) in anonymousSources" :key="sourceId">
                    <v-list-tile-action>
                      <v-switch v-model="sourcesVisibility[sourceId]"></v-switch>
                    </v-list-tile-action>
                    <v-list-tile-content @click.prevent="sourcesVisibility[sourceId] != sourcesVisibility[sourceId]">
                      {{sourceId}}
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>

      </div>
    </v-content>
  </v-layout>
</template>

<script>
import {get} from "axios";
import getObjectValue from "lodash/get";
import {all as mergeAll} from "deepmerge";
import {bbox, area, point} from "turf";
import isPointInPolygon from "@turf/boolean-point-in-polygon";

// mapbox-gl dependencies
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import Geosearch from "@/components/Geosearch";

import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglScaleControl,
  MglGeojsonLayer,
  MglVectorLayer,
} from "vue-mapbox";

import {baseStyle, cadastreStyle, infrastructureStyle, labelsStyle, cartobioStyle} from "@/assets/styles/index.js";
import ParcelsList from "@/components/ParcelsList";
import SelectedParcelsDetails from "@/components/SelectedParcelsDetails";
import ParcelDetails from "@/components/ParcelDetails";
import ParcelDetailsPopup from "@/components/ParcelDetailsPopup";

import { mapGetters, mapState } from 'vuex';

function queryOperatorParcels (operatorParcels, lngLat) {
  const p = point(lngLat)

  return Object.entries(operatorParcels).reduce((hashMap, [year, {features}]) => {
    const foundFeature = features.find(feature => isPointInPolygon(p, feature.geometry))

    return foundFeature ? {...hashMap, [year]: foundFeature} : hashMap
  }, {})
}

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

export default {
  name: "Map",

  metaInfo: {
    title: 'Parcellaire bio',
  },

  components: {
    ParcelsList,
    SelectedParcelsDetails,
    ParcelDetails,
    ParcelDetailsPopup,
    Geosearch,
    MglNavigationControl,
    MglGeolocateControl,
    MglScaleControl,
    MglVectorLayer,
    MglGeojsonLayer,
    MglMap
  },
  data() {
    return {
      // we place this property in created() to avoid Vue Observability
      // When observed, the map object is mutated and styles become broken
      //map: null,
      mapPadding: { top: 10, bottom: 25, left: 15, right: 5 },
      zoom: null,
      center: null,
      mapStyle: mergeAll([baseStyle, infrastructureStyle, cadastreStyle, cartobioStyle, labelsStyle]),

      // current operator data
      operator: {},

      operatorParcelSources: [
        [2020, 'rpgbio2020v1'],
        [2019, 'rpgbio2019v4'],
        [2018, 'rpgbio2018v9'],
        [2017, 'rpgbio2017v7'],
      ],

      parcelsOperator: {
        2020: geoJsonTemplate,
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

      // popup data with parcel history
      hoveredParcelFeatures: {
        anon: [],
        operator: {},
        cadastre: null
      },

      // show drawer
      drawer: false,
      // mini drawer display
      mini: false,

      // edit mode
      editMode: false,

      sourcesVisibility: {},

      // misc data
      filterLabel: {
        // espace collaboratif field name
        filter: "pacage",
        // agence bio field name
        property: "numeroPacage"
      },
      // filterLabel: {
      //   filter: "numerobio",
      //   property: "numeroBio"
      // },
      expandLayers: [true],
      displaySurvey: true,
      // new parcel dialog
      setUpParcel: false,
      showLayersCard: false,

      // list of years in CartoBio. Need to find a more automated way to get this for the future.
      // Also indirect impact on layersVisible and parcelsOperator
      // layers display in the order of years : last year in this array on top
      years: [2017, 2018, 2019, 2020]
    };
  },
  // event bus
  props: {
    bus: {
      required: true
    },
    pacageId: {
      type: String,
      default: null
    },
    latLonZoom: {
      type: String,
      default: '@46.874,3.097,5'
    }
  },
  created: function() {
    this.map = null

    const [, lat, lon, zoom] = this.latLonZoom.match(/@([0-9.-]+),([0-9.-]+),(\d+)/)

    this.$watch('sourcesVisibility', (sourcesVisibility) => {
      const { mapStyle } = this

      Object.entries(sourcesVisibility).forEach(([sourceId, isVisible]) => {
        const layers = mapStyle.layers.filter(layer => layer['source-layer'] === sourceId)
        const newVisibility = isVisible ? 'visible' : 'none'

        layers.forEach(layer => layer.layout.visibility = newVisibility)
      })
    }, { deep: true })

    this.zoom = Number(zoom);
    this.center = [Number(lon), Number(lat)];

    // get the current operator
    this.operator = this.getOperator;
    if (getObjectValue(this.operator, "numeroPacage") && !getObjectValue(this.operator, "title")) {
      alert(
        "Le numéro de Pacage n'est pas pour le moment rattaché à un opérateur." +
          "Merci de faire la mise à jour du numéro pacage de l'opérateur sur le site https://notification.agencebio.org/"
      );
      this.operator.title = "pacage : " + this.operator.numeroPacage;
      this.filterLabel = { filter: "pacage", property: "numeroPacage" };
    }

    // if there is an operator, show drawer.
    this.drawer = getObjectValue(this.getOperator, "title");

    if (getObjectValue(this.operator, "numeroBio") || getObjectValue(this.operator, "numeroPacage")) {
      // Doc : https://espacecollaboratif.ign.fr/api/doc/transaction
      // mongoDB filter and not standard WFS filter.
      const baseParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "GeoJSON",
        typeName: null,
        srsname: "4326",
        filter: JSON.stringify({
          // this is intended to work only with numeroPacage
          // we get them from AgenceBio with 8 or 9 chars,
          // but RPG data are always with 9 chars.
          // IDs formated as integer when they are strings...
          [this.filterLabel.filter]: String(this.operator[this.filterLabel.property]).padStart(9, '0')
        })
      };

      const {VUE_APP_ESPACE_COLLAB_LOGIN: login} = process.env
      const {VUE_APP_ESPACE_COLLAB_PASSWORD: psswd} = process.env
      const headers = {
        Authorization: "Basic " + btoa(`${login}:${psswd}`)
      }

      this.operatorParcelSources.forEach(([year, layerName]) => {
        const params = JSON.parse(JSON.stringify(baseParams));
        params.typeName = layerName;

        get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
          params,
          headers
        })
        .then(data => this.addOperatorData(data.data, year));
      })
    }
  },
  computed: {
    // @see https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper
    ...mapGetters(['getProfile', 'getOperator']),
    ...mapGetters('user', ['isAuthenticated']),
    ...mapState(['currentYear']),

    vectorLayers () {
      return this.mapStyle.layers
        .filter(({ id }) => id.match(/^rpg-anon-/))
    },

    geojsonLayers () {
      return this.mapStyle.layers
        .filter(({ id }) => id.match(/^operator/))
    },

    anonymousSources () {
      return this.mapStyle.layers
        .filter(({ id }) => id.match(/^rpg-anon-bio-/))
        .map(layer => layer['source-layer'])
        .filter((id, i, array) => array.slice(i + 1).includes(id))
    },

    operatorLayers () {
      return []/*operatorStyle.layers*/
        .map(({ id }) => id)
        .map(id => id.replace(/-[a-z]+$/, ''))
        .filter((id, i, array) => array.slice(i + 1).includes(id))
    },

    // to display the years in right order in the layers panel
    sortedYears() {
      return this.operatorParcelSources.map(([year]) => year).reverse();
    }
  },
  methods: {
    /*https://soal.github.io/vue-mapbox/guide/basemap.html#map-actions
      May be usefull to handle promise and avoid the mess it is right now for map init
    */

    onMapLoaded({map}) {
      // for future reference in events
      // ideally, it would be ideal to stop referencing `this.map` and deal with a pure component instead
      this.map = map

      this.$set(this.sourcesVisibility, `anon_rpg_${this.currentYear}`, true)
      this.$set(this.sourcesVisibility, `anon_rpgbio_${this.currentYear}`, true)

      this.updateHash(map)
      map.on('moveend', () => this.updateHash(map))
      map.on('zoomend', () => this.updateHash(map))

      // add map sources
      if (this.isAuthenticated) {
        this.loadLayers(map);
      }

      map.on("mousemove", ({target:map, lngLat, point}) => {
        const renderedFeatures = map.queryRenderedFeatures(point)

        this.hoveredParcelFeatures = {
          // anonymous source layers are named like 'anon_..._20xx'
          anon: renderedFeatures.filter(({sourceLayer}) => sourceLayer && sourceLayer.indexOf('anon_') === 0),
          operator: queryOperatorParcels(this.parcelsOperator, [lngLat.lng, lngLat.lat]),
          cadastre: renderedFeatures.find(({source, layer}) => layer.type === 'fill' && source === 'cadastre')
        }
      });

      // handle click on layers
      map.on("click", `operator-parcels-${this.currentYear}`, (e) => {
        this.selectParcel(e.features[0]);
      });

      if (this.operator.title && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }
    },

    updateHash(map) {
      const {lat,lng} = map.getCenter()
      const zoom = Math.floor(map.getZoom())

      const {pacageId} = this
      const latLonZoom = `@${lat},${lng},${zoom}`

      this.$router.replace({
        name: pacageId ? 'mapWithPacage' : 'map',
        params: {pacageId, latLonZoom}
      })
      .catch(error => {
        // we can safely ignore duplicate navigation
        // as I do not know if I can predict the upcoming url
        if (error.name !== 'NavigationDuplicated'){
          console.error(error);
        }
      })
    },

    loadLayers(map) {
      this.showLayersCard = true;
      console.log('loadLayers(map)')

      if (!map.getSource("selected")) {
        map.addSource("selected", {
          type: "geojson",
          data: this.selectedParcels
        });
      }
      if (!map.getSource("highlight")) {
        map.addSource("highlight", {
          type: "geojson",
          data: this.highlightedParcels
        });
      }

      map.addLayer({
        id: "highlighted-parcels",
        type: "fill",
        source: "highlight",
        paint: {
          "fill-color": [
            "match",
            ["get", "bio"],
            "0",
            "rgba(111, 61, 72, 1)",
            "1",
            "rgba(6, 71, 75, 1)",
            "white"
          ],
          "fill-outline-color": "rgba(100, 200, 240, 1)",
          "fill-opacity": 1
        }
      });

      // selected
      map.addLayer({
        id: "selected-parcels",
        type: "fill",
        source: "selected",
        paint: {
          "fill-color": [
            "match",
            ["get", "bio"],
            "0",
            "rgba(156, 86, 100, 1)",
            "1",
            "rgba(9, 99, 106, 1)",
            "white"
          ],
          "fill-outline-color": "rgba(100, 200, 240, 1)",
          "fill-opacity": 1
        }
      });
    },

    handleSearchResult(value) {
      // this.map.panTo(value.geometry.coordinates);
      this.map.easeTo({
        center: value.geometry.coordinates,
        zoom: 10 + parseInt(value.importance) // may be improved, difficult to know what importance stands for
      });
    },

    displayOperatorLayer(data) {
      this.addOperatorData(data, this.currentYear);

      this.bboxOperator = bbox(data);
      if (this.map && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }
      if (this.map) {
        if (
          this.bboxOperator[0] !== undefined &&
          this.bboxOperator[0] !== Infinity
        ) {
          this.map.fitBounds(this.bboxOperator, {
            padding: this.mapPadding
          });
        }
      }
    },
    // function  used by draw features
    updateArea(e) {
      var data = draw.getAll();
      if (data.features.length > 0) {
        // var area = area(data);
        // // restrict to area to 2 decimal points
        // var rounded_area = Math.round(area * 100) / 100;
      } else {
        if (e.type !== "draw.delete")
          alert("Use the draw tools to draw a polygon!");
      }
    },
    startEditMode() {
      this.editMode = true;
      this.map.addControl(draw, "top-right");
      this.map.on(
        "draw.create",
        function(e) {
          let newFeature = e.features[0];
          let surface = area(newFeature);
          surface = Math.round(surface * 100) / 100; // round to 2 decimals
          newFeature.properties.surfgeo = surface;
          this.newParcel = newFeature;
          this.setUpParcel = true;
        }.bind(this)
      );
      this.map.on("draw.delete", this.updateArea);
      this.map.on("draw.update", this.updateArea);
    },

    setUpMapOperator() {
      const {map} = this

      if (
        this.bboxOperator[0] !== undefined &&
        this.bboxOperator[0] !== Infinity
      ) {
        map.fitBounds(this.bboxOperator, {
          padding: this.mapPadding
        });
      }

      this.isOperatorOnMap = true;
      this.sourcesVisibility[`operator-parcels-${this.currentYear}`] = true
    },
    hoverParcel(parcel) {
      this.highlightedParcels = {
        features: [parcel],
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
    },
    stopHovering() {
      this.highlightedParcels = {
        features: [],
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
    },
    hoverIlot(ilot) {
      this.highlightedParcels = {
        features: ilot.parcels,
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
    },
    selectParcel(parcel) {
      let tmp = this.parcelsOperator[this.currentYear].features.find(function(feature) {
        return feature.id === parcel.id;
      });
      tmp.properties.selected = !tmp.properties.selected;
      if (tmp.properties.selected) {
        this.selectedParcels.features.push(tmp);
      } else {
        // _.remove doesn't trigger component updates
        // https://stackoverflow.com/questions/42090651/computed-properties-not-updating-when-using-lodash-and-vuejs
        this.selectedParcels.features = this.selectedParcels.features.filter(function(feature) {
          return feature.id !== tmp.id;
        });
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    selectAllParcels(bool) {
      this.parcelsOperator[this.currentYear].features.forEach(function(parcel) {
        parcel.properties.selected = bool;
      });
      if (bool) {
        this.selectedParcels.features = this.parcelsOperator[this.currentYear].features;
      } else {
        this.selectedParcels.features = [];
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    saveParcel() {
      this.setUpParcel = !this.setUpParcel;
      this.parcelsOperator[this.currentYear].features.push(this.newParcel);
    },
    updateNewParcel(newData) {
      this.newParcel.properties = newData[0];
      this.$forceUpdate();
    },

    addOperatorData(data, year) {
      this.parcelsOperator[year] = data;
      if (this.map) {
        this.map
          .getSource(`operatorParcels${year}`)
          .setData(this.parcelsOperator[year]);
      }
    },

    displayErrorMessage(data) {
      console.error(data);
      alert("Impossible de trouver le parcellaire de cet opérateur");
    },

    // annual parcel layer
    getYearLayer(layerYear, colorBio, colorNotBio, fillColor) {
      return {
        id: "operator-parcels-" + layerYear,
        type: "fill",
        source: "operatorParcels" + layerYear,
        paint: {
          "fill-color": [
            "match",
            ["get", "bio"],
            "0",
            colorNotBio,
            "1",
            colorBio,
            "white"
          ],
          "fill-outline-color": fillColor,
          "fill-opacity": 0.8
        },
        layout : {
          visibility: "none"
        }
      };
    }
  },
  watch: {
    getProfile: function(newProfile, oldProfile) {
      // if the map is not yet loaded, it will load layers
      // best would be to populate layers data and make the data react to them
      if (this.map && newProfile.active) {
        console.log('this.loadLayers(this.map);')
        this.loadLayers(this.map);
      }
      // user is being logged out
      else if (this.map && (!newProfile.active && oldProfile.active)) {
        this.hideLayers(this.map)
      }
    }
  }
};
</script>

<style lang="scss">
@import '~mapbox-gl/dist/mapbox-gl.css';
@import "~@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
</style>

<style lang="scss" scoped>
.map {
  height: 100%;
  width: 100%;
  position: relative;
}
.toolbar-search {
  margin-left: 50%;
  transform: translateX(-50%) !important; // it gets overriden by vuetify
  border-radius: 4px;
}
.data-card {
  position: absolute;
  top: 10px;
  margin-left: 54px;
}
.layers-panel {
  position: absolute;
  top: 20px;
  right: 10px;
}
.label-legend {
  padding-left: 3px;
}
.expansion-title {
  display: flex;
}
</style>
