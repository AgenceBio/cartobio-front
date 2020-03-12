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
        :parcels.sync="parcelsOperator[2020]"
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
          <v-toolbar floating dense class="my-3 toolbar-search">
            <Geosearch @searchCompleted="handleSearchResult"></Geosearch>
          </v-toolbar>
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
        <v-flex class="layers-panel" v-show="showLayersCard">
          <v-expansion-panel popout expand v-bind:value="expandLayers">
            <v-expansion-panel-content>
              <template v-slot:header>
                <div class="expansion-title">
                  <v-icon>layers</v-icon>Layers
                </div>
              </template>
              <v-card>
                <v-list class="pt-0" dense two-line>
                  <!-- List of years with parcels from the operator -->
                  <v-list-tile
                    v-for="(year, index) in sortedYears"
                    :key="index"
                    v-bind:class="{'not-visible': !layersVisible['anon' + year].visibility}"
                  >
                    <v-list-tile-action>
                      <v-btn icon @click="toggleLayerAnon(year)">
                        <v-icon v-if="layersVisible['anon' + year].visibility">visibility</v-icon>
                        <v-icon v-if="!layersVisible['anon' + year].visibility">visibility_off</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                    <v-list-tile-content>
                      Parcelles Bio RPG {{year}}
                      <v-sheet
                        class="d-flex"
                        v-bind:style="{'background-color' : layersVisible['anon' + year].color, 'border-color' : layersVisible['anon' + year].color}"
                        height="20"
                        width="20"
                      ></v-sheet>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
                <v-divider></v-divider>
                <v-list dense class="pt-0" v-if="operator.title" two-line>
                  <!-- List of years with parcels from the operator -->
                  <v-list-tile
                    v-for="(year, index) in sortedYears"
                    :key="index"
                    v-bind:class="{'not-visible': !layersVisible[year].visibility}"
                  >
                    <v-list-tile-action>
                      <v-btn icon @click="toggleLayerOperator(year)">
                        <v-icon v-if="layersVisible[year].visibility">visibility</v-icon>
                        <v-icon v-if="!layersVisible[year].visibility">visibility_off</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                    <v-list-tile-content d-flex>
                      <span>Parcelles Exploitant {{year}}</span>
                      <div style="display: flex; flex-direction: row; width: 100%;">
                        <v-sheet
                          v-bind:style="{'background-color' : layersVisible[year].colorBio, 'border-color' : layersVisible[year].colorBio}"
                          height="20"
                          width="20"
                        ></v-sheet>
                        <span class="label-legend">Bio</span>
                        <v-spacer></v-spacer>
                        <v-sheet
                          v-bind:style="{'background-color' : layersVisible[year].colorNotBio, 'border-color' : layersVisible[year].colorNotBio}"
                          height="20"
                          width="20"
                        ></v-sheet>
                        <span class="label-legend">Conven.</span>
                        <v-spacer></v-spacer>
                      </div>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>

        <!--<v-card class="survey" v-show="displaySurvey">
          <v-btn flat icon color="black" class="close-survey" @click="displaySurvey = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title primary-title>
            <h3 class="headline mb-0">Donnez nous votre avis !</h3>
          </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>Un petit questionnaire est prévu pour ça :
            <v-spacer></v-spacer>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <a href="https://fr.surveymonkey.com/r/339NRFN" target="_blank">
              <v-btn color="primary">
                <v-icon>open_in_new</v-icon>questionnaire
              </v-btn>
            </a>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>-->
      </div>
    </v-content>
  </v-layout>
</template>

<script>
import {get} from "axios";
import {fromPairs, get as getObjectValue, groupBy, reduce} from "lodash";
import {bbox, center, area} from "turf";

// mapbox-gl dependencies
import {Popup} from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import SphericalMercator from "sphericalmercator";
import Geosearch from "@/components/Geosearch";

// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglScaleControl
} from "vue-mapbox";

import ParcelsList from "@/components/ParcelsList";
import SelectedParcelsDetails from "@/components/SelectedParcelsDetails";
import ParcelDetails from "@/components/ParcelDetails";

let mercator = new SphericalMercator({
  size: 256
});

// map style.
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
          // "&LAYER= CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle" + // WFS not wmts
          "&TILEMATRIX={z}" +
          "&TILEROW={y}" +
          "&TILECOL={x}"
      ],
      opacity: "1",
      attribution: "IGN-F/Géoportail",
      tileSize: 256
    },
    "geographical-names": {
      type: "raster",
      tiles: [
        "https://wxs.ign.fr/" +
          process.env.VUE_APP_API_IGN +
          "/geoportail/wmts?" +
          "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
          "&STYLE=normal" +
          "&TILEMATRIXSET=PM" +
          "&FORMAT=image/png" +
          "&layer=GEOGRAPHICALNAMES.NAMES" +
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
    },
    {
      id: "geographical-names-tiles",
      type: "raster",
      source: "geographical-names",
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

export default {
  name: "Map",
  components: {
    ParcelsList,
    SelectedParcelsDetails,
    ParcelDetails,
    Geosearch,
    MglNavigationControl,
    MglGeolocateControl,
    MglScaleControl,
    MglMap
  },
  data() {
    return {
      // map related data:
      map: undefined,
      mapPadding: { top: 10, bottom: 25, left: 15, right: 5 },
      zoom: null,
      center: null,

      // anonymous layers
      anonLayers: {},
      // current operator data
      operator: {},
      // operator parcels by year
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
      // popup with short parcel infos
      popupParcel: new Popup({
        closeButton: false
      }),
      // popup with agregated parcels infos
      popupSelectedParcels: new Popup({
        closeButton: true
      }),
      // placeholder for layers for an operator
      layersOperator: {},

      // display related data

      // show drawer
      drawer: false,
      // mini drawer display
      mini: false,

      // edit mode
      editMode: false,

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
      layersVisible: {
        // https://gka.github.io/palettes/#/9|d|169a39|ac195e|1|1
        2020: {
          visibility: false,
          colorBio: "#62d771",
          colorNotBio: "#fda8d4"
        },
        2019: {
          visibility: false,
          colorBio: "#1fa341",
          colorNotBio: "#e3659d"
        },
        2018: {
          visibility: false,
          colorBio: "#006e1b",
          colorNotBio: "#b32d64"
        },
        2017: {
          visibility: false,
          colorBio: "#003c00",
          colorNotBio: "#740032"
        },
        anon2020: { visibility: false, color: "#D0D32E" },
        anon2019: { visibility: false, color: "#D0D32E" },
        anon2018: { visibility: false, color: "#D0D32E" },
        anon2017: { visibility: false, color: "#D0D32E" }
      },
      // list of years in CartoBio. Need to find a more automated way to get this for the future.
      // Also indirect impact on layersVisible and parcelsOperator
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
      default: '@44.688729,5.150809,12'
    }
  },
  created: function() {
    // map will be available when loaded, in onMapLoaded
    this.map = null;

    const [, lat, lon, zoom] = this.latLonZoom.match(/@([0-9.-]+),([0-9.-]+),(\d+)/)

    this.zoom = Number(zoom);
    this.center = [Number(lon), Number(lat)];

    // get the current operator
    this.operator = this.getOperator;

    if (getObjectValue(this.operator, "pacage") && !getObjectValue(this.operator, "title")) {
      alert(
        "Le numéro de Pacage n'est pas pour le moment rattaché à un opérateur." +
          "Merci de faire la mise à jour du numéro pacage de l'opérateur sur le site https://notification.agencebio.org/"
      );
      this.operator.title = "pacage : " + this.operator.pacage;
      this.operator.pacage = '"' + this.operator.pacage + '"';
      this.filterLabel = { filter: "pacage", property: "numeroPacage" };
    }

    // if there is an operator, show drawer.
    this.drawer = getObjectValue(this.$store.getters.getOperator, "title");

    if (getObjectValue(this.operator, "numeroBio") || getObjectValue(this.operator, "pacage")) {
      // Doc : https://espacecollaboratif.ign.fr/api/doc/transaction
      // mongoDB filter and not standard WFS filter.
      let params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "GeoJSON",
        typeName: "rpgbio2020v1",
        srsname: "4326",
        filter: JSON.stringify({
          // this is intended to work only with numeroPacage
          // we get them from AgenceBio with 8 or 9 chars,
          // but RPG data are always with 9 chars.
          // IDs formated as integer when they are strings...
          [this.filterLabel.filter]: String(this.operator[this.filterLabel.property]).padStart(9, '0')
        })
      };

      let tokenCollab = btoa(
        process.env.VUE_APP_ESPACE_COLLAB_LOGIN +
          ":" +
          process.env.VUE_APP_ESPACE_COLLAB_PASSWORD
      );

      // get 2020 parcels from the operator
      get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
        params: params,
        headers: {
          Authorization: "Basic " + tokenCollab
        }
      })
      .then(data => this.displayOperatorLayer(data.data));
      // .catch(data => this.displayErrorMessage(data));

      // get 2019 parcels from the operator
      let params2019 = JSON.parse(JSON.stringify(params));
      params2019.typeName = "rpgbio2019v4";
      get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
        params: params2019,
        headers: {
          Authorization: "Basic " + tokenCollab
        }
      })
      .then(data => this.addOperatorData(data.data, "2019"));

      // get 2018 parcels from the operator
      let params2018 = JSON.parse(JSON.stringify(params));
      params2018.typeName = "rpgbio2018v9";
      get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
        params: params2018,
        headers: {
          Authorization: "Basic " + tokenCollab
        }
      })
      .then(data => this.addOperatorData(data.data, "2018"));

      // get 2017 parcels from the operator
      let params2017 = JSON.parse(JSON.stringify(params));
      params2017.typeName = "rpgbio2017v7";
      get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
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
      this.layersOperator["2020"] = this.getYearLayer(
        "2020",
        "#62d771", // bio
        "#fda8d4", // not bio
        "#169A39" // outline
      );
      this.layersOperator["2019"] = this.getYearLayer(
        "2019",
        "#1fa341", // bio
        "#e3659d", // not bio
        "#169A39" // outline
      );
      this.layersOperator["2018"] = this.getYearLayer(
        "2018",
        "#006e1b", // bio
        "#b32d64", // not bio
        "#169A39" // outline
      );
      this.layersOperator["2017"] = this.getYearLayer(
        "2017",
        "#003c00", // bio
        "#740032", // not bio
        "#169A39" // outline
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
    // map Style
    mapStyle() {
      // To improve
      // should not be in computed style. computed style should work for displaying/hiding layers already defined and editing their sources.
      let computedMapStyle = mapStyle;
      return computedMapStyle;
    },
    sortedYears() {
      let yearsArr = this.years.slice();
      return yearsArr.reverse();
    }
  },
  methods: {
    /*https://soal.github.io/vue-mapbox/guide/basemap.html#map-actions
      May be usefull to handle promise and avoid the mess it is right now for map init
    */

    onMapLoaded(event) {
      this.map = event.map;

      this.updateHash()
      this.map.on('moveend', () => this.updateHash())
      this.map.on('zoomend', () => this.updateHash())

      // add map sources
      // this.map.addSource("bio-tiles", bioSource);
      if (this.getProfile.active) {
        this.loadLayers();
      }
      // this.map.on(
      //   "click",
      //   "collabio",
      //   function(e) {
      //     new Popup()
      //       .setLngLat(e.lngLat)
      //       .setHTML(e.features[0].properties.code_cultu)
      //       .addTo(this.map);
      //   }.bind(this)
      // );

      let hoverPopup = new Popup({
        closeButton: false,
        closeOnClick: false
      });

      this.map.on("mousemove", (e) => {
        let features = this.map.queryRenderedFeatures(e.point);
        if (features.length) {
          hoverPopup
            .trackPointer()
            .setHTML(this.setPopupHtml(features))
            .addTo(this.map)
        }
        else {
          hoverPopup.remove();
        }
      });

      // handle click on layers
      this.map.on("click", "operator-parcels-2020", (e) => {
        this.selectParcel(e.features[0]);
      });

      if (this.operator.title && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }
    },

    // return html code that will display in the popup
    setPopupHtml(features) {
      let hoveredData = {};
      let featureGroups = groupBy(features, function(feature) {
        return feature.layer.id.startsWith("operator") ? "operator" : "anonymous"
      });

      if (featureGroups.operator) {
        hoveredData = reduce(featureGroups.operator, function(result, feature) {
          let featureKey = feature.layer.id.split('-')[2];
          result[featureKey] = feature.properties;
          return result;
        }, {});
      }
      // we only replace the data if there is no operator data for the year
      if (featureGroups.anonymous) {
        hoveredData = reduce(featureGroups.anonymous, function(result, feature) {
          let featureKey = feature.layer.id.split('-')[2];
           result[featureKey] = result[featureKey] ? result[featureKey] : feature.properties;
          return result;
        }, hoveredData);
      }
      let htmlContent = "";
      if (getObjectValue(hoveredData, ["2020", "numilot"])) {
        htmlContent += "<h3>Ilot " + hoveredData["2020"].numilot + " Parcelle " + hoveredData["2020"].numparcel + "</h3>" 
      }
      Object.keys(hoveredData).forEach(function(year) {
        let bioStatus = hoveredData[year].bio == 1 ? "Bio" : "Conventionnel";
        htmlContent += year + " - " + hoveredData[year].codecultu + " - " + bioStatus + "<br/>";
      });

      // eslint-disable-next-line no-unused-vars
      let html = "<div>" + htmlContent +  "</div>";
      
      return html;
    },

    updateHash() {
      const {lat,lng} = this.map.getCenter()
      const zoom = Math.ceil(this.map.getZoom())

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

    loadLayers() {
      this.showLayersCard = true;

      this.years.forEach((year) => {
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
            "fill-outline-color": "#b0b22b",
            "fill-opacity": 0.6
          },
          tms: true,
          maxzoom: 24,
          layout: {visibility: 'none'}
        };
        this.anonLayers[year] = bioLayer;
        this.map.addLayer(this.anonLayers[year]);
        this.map.addLayer({
          id: `bio-tiles-${year}-border`,
          type: "line",
          source: "bio-" + year,
          "source-layer": "anon_rpgbio_" + year,
          minzoom: 10,
          paint: {
            "line-color": "#D0D32E",
            "line-opacity": 0.9,
            "line-width": 1
          },
          layout: {visibility: 'none'}
        });
      });

      this.toggleLayerAnon(2020, true);

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
      if (!this.map.getSource("operatorParcels2020")) {
        this.map.addSource("operatorParcels2020", {
          type: "geojson",
          data: this.parcelsOperator[2020]
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
      // highlight
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
        id: "highlighted-parcels-border",
        type: "line",
        source: "highlight",
        paint: {
          "line-color": "rgba(100, 200, 240, 1)",
          "line-width": 2
        }
      });

      // selected
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
    },
    handleSearchResult(value) {
      // this.map.panTo(value.geometry.coordinates);
      this.map.easeTo({
        center: value.geometry.coordinates,
        zoom: 10 + parseInt(value.importance) // may be improved, difficult to know what importance stands for
      });
    },
    // not used currently
    transformRequest(url, resourceType) {
      let newUrl = url;
      if (
        resourceType === "Tile" &&
        url.startsWith("https://espacecollaboratif.ign.fr/gcms/wfs/cartobio")
      ) {
        let paramArr = [];
        url.split("&").forEach(function(param) {
          let subparam = param.split("=");
          paramArr.push(subparam);
        });
        let args = fromPairs(paramArr);
        let zoom = args.TILEMATRIX; // z
        let row = args.TILEROW; // y
        let col = args.TILECOL; // x
        let bbox = mercator.bbox(col, row, zoom, true, "4326");
        newUrl = newUrl.split("TILEMATRIX")[0];
        newUrl += "bbox=" + bbox.toString() + ",WGS84";
      }
      return { url: newUrl };
    },
    displayOperatorLayer(data) {
      this.addOperatorData(data, "2020");
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
      // this.map.addControl(draw, "top-right");
      // this.map.on(
      //   "draw.create",
      //   function(e) {
      //     let newFeature = e.features[0];
      //     let surface = turf.area(newFeature);
      //     surface = Math.round(surface * 100) / 100; // round to 2 decimals
      //     newFeature.properties.surfgeo = surface;
      //     this.newParcel = newFeature;
      //     this.setUpParcel = true;
      //   }.bind(this)
      // );
      // this.map.on("draw.delete", this.updateArea);
      // this.map.on("draw.update", this.updateArea);
      if (
        this.bboxOperator[0] !== undefined &&
        this.bboxOperator[0] !== Infinity
      ) {
        this.map.fitBounds(this.bboxOperator, {
          padding: this.mapPadding
        });
      }
      this.isOperatorOnMap = true;
      this.years.forEach(year => {
        this.map.addLayer(this.layersOperator[year]);
        this.map.addLayer({
          ...this.layersOperator[year],
          id: this.layersOperator[year].id + "-border",
          type: "line",
          paint: {
            "line-color": "#FFF",
            "line-opacity": 0.6,
            "line-width": 1
          }
        });
      });
      this.toggleLayerOperator("2020", true);
    },
    hoverParcel(parcel) {
      this.highlightedParcels = {
        features: [parcel],
        type: "FeatureCollection"
      };
      this.map.getSource("highlight").setData(this.highlightedParcels);
      this.popupParcel
        .setLngLat(center(this.highlightedParcels).geometry.coordinates)
        .setHTML(parcel.properties.codecultu)
        .addTo(this.map);
    },
    stopHovering() {
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
      let tmp = this.parcelsOperator[2020].features.find(function(feature) {
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
      this.parcelsOperator[2020].features.forEach(function(parcel) {
        parcel.properties.selected = bool;
      });
      if (bool) {
        this.selectedParcels.features = this.parcelsOperator[2020].features;
      } else {
        this.selectedParcels.features = [];
      }
      this.map.getSource("selected").setData(this.selectedParcels);
    },
    saveParcel() {
      this.setUpParcel = !this.setUpParcel;
      this.parcelsOperator[2020].features.push(this.newParcel);
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
    toggleLayerOperator(layerYear, visibility) {
      let layer = this.layersOperator[layerYear];
      if (typeof visibility === "undefined") {
        visibility = !this.layersVisible[layerYear].visibility;
      }
      this.layersVisible[layerYear].visibility = visibility;
      this.toggleLayer(layer.id, visibility);
    },
    // layerYear: layer that we want to set the visibility
    // visibility : boolean. true = layer is visible
    toggleLayerAnon(layerYear, visibility) {
      let layer = this.anonLayers[layerYear];
      if (typeof visibility === "undefined") {
        visibility = !this.layersVisible["anon" + layerYear].visibility;
      }
      this.layersVisible["anon" + layerYear].visibility = visibility;
      this.toggleLayer(layer.id, visibility);
    },
    // toggle visibility of layer
    toggleLayer(layer, visibility) {
      if (this.map && this.map.getLayer(layer)) {
        if (visibility) {
          this.map.setLayoutProperty(layer, 'visibility', 'visible');
          this.map.setLayoutProperty(layer + '-border', 'visibility', 'visible');
        } else {
          this.map.setLayoutProperty(layer, 'visibility', 'none');
          this.map.setLayoutProperty(layer + '-border', 'visibility', 'none');
        }
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
    getProfile: function(newProfile) {
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
@import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
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
.not-visible {
  background-color: lightslategrey;
}
.label-legend {
  padding-left: 3px;
}
.expansion-title {
  display: flex;
}

.survey {
  position: absolute;
  bottom: 25px;
  right: 10px;
  .close-survey {
    position: absolute;
    top: 0px;
    right: 0px;
    margin: 0;
  }
}
</style>
