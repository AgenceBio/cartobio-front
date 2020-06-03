<template>
  <v-layout>
      <!-- Parcels List
      v-if ensure the drawer width is well taken into account for v-content display -->
      <ParcelsList
        v-if="showOperatorDetails"
        :drawer="showOperatorDetails"
        :parcels="parcelsOperator[this.currentYear]"
        :operator="operator"
        v-on:close-drawer="closeOperatorDetailsSidebar"
        v-on:hover-parcel="hoverParcel"
        v-on:stop-hovering="stopHoveringParcel"
        v-on:hover-ilot="hoverIlot"
        v-on:stop-hovering-ilot="stopHoveringIlot"
        v-on:zoom-on="zoomOn"
      ></ParcelsList>

      <SearchSidebar  :drawer="showSearch"
                      :organismeCertificateur="getProfile.organismeCertificateur"
                      :organismeCertificateurId="getProfile.organismeCertificateurId"
                      :organismeCertificateurOperators="organismeCertificateurOperators"
                      @select-operator="setOperator($event)"
                      @flyto="flyTo"></SearchSidebar>
    <v-content>
      <!-- Map division so it takes the full width/height left -->
      <div class="map">
        <v-dialog v-model="setUpParcel" persistent v-if="operator.title">
          <v-card>
            <v-card-title class="headline">Nouvelle Parcelle - {{this.operator.title}}</v-card-title>
            <v-card-text>
              <ParcelDetails
                :operator="operator"
                :parcel="newParcel"
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

          <MglNavigationControl position="top-left" :showCompass="false" />
          <MglGeolocateControl position="top-left" />
          <MglScaleControl position="bottom-left" unit="metric" />
          <ParcelDetailsPopup :features="hoveredParcelFeatures" :coordinates="hoveredParcelCoordinates" />
          <IlotMarkerDirection v-if="displayIlotDirection" :ilotCenterCoordinates="ilotCenterCoordinates" :mapBounds="mapBounds" :bboxMap="bboxMap" :mapCenter="mapCenter" :hoveredIlotName="hoveredIlotName">
          </IlotMarkerDirection>

          <MglGeojsonLayer
            v-if="getProfile.organismeCertificateurId"
            before="place-continent"
            sourceId="certification-body-operators"
            layerId="certification-body-clusters-area"
            :layer="layerStyle('certification-body-clusters-area')" />
          <MglGeojsonLayer
            v-if="getProfile.organismeCertificateurId"
            before="place-continent"
            sourceId="certification-body-operators"
            layerId="certification-body-clusters-count"
            :layer="layerStyle('certification-body-clusters-count')" />
        </MglMap>

        <!-- Layers selector -->
        <v-flex class="layers-panel" v-show="isAuthenticated">
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
                  <v-list-tile
                    v-for="(year, index) in sortedYears"
                    :key="index"
                     @click="toggleLayerOperator(year)"
                  >
                    <v-list-tile-action>
                      <v-switch :color="layersVisible[year].colorBio" v-model="layersVisible[year].visibility" @click="toggleLayerOperator(year)" />
                    </v-list-tile-action>
                    <v-list-tile-content>
                      {{year}}
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>

                <v-divider></v-divider>

                <v-list-tile>
                  <v-subheader>Registre Parcellaire Graphique Bio</v-subheader>
                </v-list-tile>

                <v-list class="pt-0" dense>
                  <!-- List of years with parcels from the operator -->
                  <v-list-tile
                    v-for="(year, index) in sortedYears"
                    :key="index"
                    @click="toggleLayerAnon(year)"
                  >
                    <v-list-tile-action>
                      <v-switch :color="layersVisible['anon' + year].color" v-model="layersVisible['anon' + year].visibility" @click="toggleLayerAnon(year)"></v-switch>
                    </v-list-tile-action>
                    <v-list-tile-content>
                      {{year}}
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
import {bbox, bboxPolygon, center, area, point} from "turf";
import {all as mergeAll} from "deepmerge";
import isPointInPolygon from "@turf/boolean-point-in-polygon";
import centroid from '@mapbox/polylabel';

// mapbox-gl dependencies
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglScaleControl,
  MglGeojsonLayer,
} from "vue-mapbox";

import {baseStyle, cadastreStyle, cartobioStyle, infrastructureStyle} from "@/assets/styles/index.js";
import ParcelsList from "@/components/ParcelsList";
import ParcelDetails from "@/components/ParcelDetails";
import ParcelDetailsPopup from "@/components/ParcelDetailsPopup";
import SearchSidebar from "@/components/Map/SearchSidebar";
import IlotMarkerDirection from "@/components/IlotMarkerDirection";

import { mapGetters, mapState } from 'vuex';

const { VUE_APP_API_ENDPOINT: API_ENDPOINT } = process.env;

function queryOperatorParcels (operatorParcels, lngLat) {
  const p = point(lngLat)

  return Object.entries(operatorParcels).reduce((hashMap, [year, {features}]) => {
    const foundFeature = features.find(feature => isPointInPolygon(p, feature.geometry))

    return foundFeature ? {...hashMap, [year]: foundFeature} : hashMap
  }, {})
}

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

  metaInfo: {
    title: 'Parcellaire bio',
  },

  components: {
    ParcelsList,
    ParcelDetails,
    ParcelDetailsPopup,
    SearchSidebar,
    MglNavigationControl,
    MglGeolocateControl,
    MglScaleControl,
    MglMap,
    IlotMarkerDirection,
    MglGeojsonLayer
  },
  data() {
    return {
      // we place this property in created() to avoid Vue Observability
      // When observed, the map object is mutated and styles become broken
      //map: null,
      mapPadding: { top: 25, bottom: 25, left: 20, right: 20 },
      zoom: null,
      center: null,
      mapStyle: mergeAll([
        baseStyle,
        cadastreStyle,
        infrastructureStyle,
        { sources: cartobioStyle.sources }
      ]),

      // anonymous layers
      anonLayers: {},

      organismeCertificateurOperators: {},

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

      // popup data with parcel history
      hoveredParcelCoordinates: undefined,
      hoveredParcelFeatures: {
        anon: [],
        operator: {},
        cadastre: null
      },

      // placeholder for layers for an operator
      layersOperator: {},

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

      highlightedParcel: null,

      // hovered ilot direction
      hoveredIlotName: "",
      bboxMap: {},
      mapCenter: [],
      mapBounds:  {},
      ilotCenterCoordinates: [],
      displayIlotDirection: false,

      layersVisible: {
        // https://gka.github.io/palettes/#/9|d|169a39|ac195e|1|1
        2020: {
          visibility: false,
          colorBio: "rgba(98, 215, 113, 1)",
          colorNotBio: "rgba(253, 168, 212, 1)"
        },
        2019: {
          visibility: false,
          colorBio: "rgba(31, 163, 65, 1)",
          colorNotBio: "rgba(227, 101, 157, 1)"
        },
        2018: {
          visibility: false,
          colorBio: "rgba(0, 110, 27, 1)",
          colorNotBio: "rgba(179, 45, 100, 1)"
        },
        2017: {
          visibility: false,
          colorBio: "rgba(0, 60, 0, 1)",
          colorNotBio: "rgba(116, 0, 50, 1)"
        },
        anon2020: { visibility: false, color: "rgba(208, 211, 46, 1)" },
        anon2019: { visibility: false, color: "rgba(208, 211, 46, 1)" },
        anon2018: { visibility: false, color: "rgba(208, 211, 46, 1)" },
        anon2017: { visibility: false, color: "rgba(208, 211, 46, 1)" }
      },
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

    this.zoom = Number(zoom);
    this.center = [Number(lon), Number(lat)];
  },
  computed: {
    // @see https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper
    ...mapGetters(['getProfile']),
    ...mapGetters({ operator: 'getOperator' }),
    ...mapGetters('user', ['isAuthenticated']),
    ...mapState('user', ['apiToken']),
    ...mapState(['currentYear']),

    showOperatorDetails () {
      return Boolean(this.isAuthenticated && this.operator.id);
    },

    showSearch () {
      return Boolean(this.isAuthenticated && !this.operator.id);
    },
    // to display the years in right order in the layers panel
    sortedYears() {
      let yearsArr = this.years.slice();
      return yearsArr.reverse();
    }
  },
  methods: {
    /**
     * @param  {String} styleId [description]
     * @return {Object<Mapbox.Layer>}
     */
    layerStyle (styleId) {
      return cartobioStyle.layers.find(({ id }) => id === styleId);
    },
   /*https://soal.github.io/vue-mapbox/guide/basemap.html#map-actions
     May be usefull to handle promise and avoid the mess it is right now for map init
   */
    onMapLoaded({map}) {
      // for future reference in events
      // ideally, it would be ideal to stop referencing `this.map` and deal with a pure component instead
      this.map = map

      this.updateHash(map)
      map.on('moveend', () => this.updateHash(map))
      map.on('zoomend', () => this.updateHash(map))

      // add map sources
      if (this.isAuthenticated) {
        this.loadLayers(map);
      }

      map.on("mousemove", ({lngLat, point}) => {
        this.buildHoveredPopup(lngLat, point);
      });

      // handle summary interactions
      // because it happens over a cluster, we can count on having 1 feature only
      let activeCluster = null;

      map.on("click", "certification-body-clusters-area", (e) => {
        const { coordinates: center } = e.features[0].geometry
        const { cluster_id: id } = e.features[0].properties

        // we zoom directly to where the cluster dissolves
        // if it's a tiny cluster, we will zoom deep (but at max level 10)
        // if it's a large cluster, we will zoom at a level it splits in at least 2 other clusters
        map.getSource('certification-body-operators').getClusterExpansionZoom(id, (error, zoom) => {
          map.flyTo({ center, zoom: Math.min(10, zoom) })
        })
      });

      map.on("mousemove", "certification-body-clusters-area", (e) => {
        const { id } = e.features[0]
        const source = 'certification-body-operators'
        map.getCanvas().style.cursor = 'pointer'

        // sometimes, mouseleave is fired after we hover another cluster
        if (activeCluster) {
          map.setFeatureState({ id: activeCluster, source }, { hover: false })
        }

        map.setFeatureState({ id, source }, { hover: true })
        activeCluster = id
      });

      map.on("mouseleave", "certification-body-clusters-area", () => {
        const id = activeCluster
        const source = 'certification-body-operators'
        map.getCanvas().style.cursor = ''

        map.setFeatureState({ id, source }, { hover: false })
        activeCluster = null
      });

      // handle click on layers
      map.on("click", `operator-parcels-${this.currentYear}`, (e) => {
        this.selectParcel(e.features[0]);
      });

      if (this.operator.title && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }
    },

    buildHoveredPopup(lngLat, point) {
      const renderedFeatures = this.map.queryRenderedFeatures(point)
      this.hoveredParcelFeatures = {
        // anonymous source layers are named like 'anon_..._20xx'
        anon: renderedFeatures.filter(({sourceLayer}) => sourceLayer && sourceLayer.indexOf('anon_') === 0),
        operator: queryOperatorParcels(this.parcelsOperator, [lngLat.lng, lngLat.lat]),
        cadastre: renderedFeatures.find(({source, layer}) => layer.type === 'fill' && source === 'cadastre')
      }

      // handle hovering effect when moving mouse on map
      let hoveredParcel = getObjectValue(this.hoveredParcelFeatures, ['operator', '2020']);
      if(hoveredParcel && this.highlightedParcel !== hoveredParcel) {
        if (this.highlightedParcel) {
          this.stopHighlightingParcel(this.highlightedParcel);
        }
        this.highlightParcel(hoveredParcel);
        this.highlightedParcel = hoveredParcel;
      } else if (this.highlightedParcel && !hoveredParcel) {
        this.stopHighlightingParcel(this.highlightedParcel);
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
        if (!map.getSource("bio-" + year)) {
          map.addSource("bio-" + year, bioSource);
        }

        if (!map.getLayer("bio-tiles-" + year)) {
          let bioLayer = {
            id: "bio-tiles-" + year,
            type: "fill",
            source: "bio-" + year,
            "source-layer": "anon_rpgbio_" + year,
            minzoom: 9,
            paint: {
              "fill-color": "rgba(208, 211, 46, 1)",
              "fill-opacity": 0.6
            },
            tms: true,
            maxzoom: 24,
            layout: {visibility: 'none'}
          };
          this.anonLayers[year] = bioLayer;
          map.addLayer(this.anonLayers[year], 'road_oneway');
          map.addLayer({
            id: `bio-tiles-${year}-border`,
            type: "line",
            source: "bio-" + year,
            "source-layer": "anon_rpgbio_" + year,
            minzoom: 10,
            paint: {
              "line-color": "rgba(208, 211, 46, 1)",
              "line-opacity": 1,
              "line-width": {
                "stops": [[9, 0], [12, 1]]
              }
            },
            layout: {visibility: 'none'}
          }, 'road_oneway');
        }
      });

      // non-bio
      if (!map.getLayer('rpg-anon-nonbio-2020-area')) {
        cartobioStyle.layers
          .filter(({ id }) => id.indexOf('rpg-') === 0)
          .forEach(layer => map.addLayer({
            ...layer,
            layout: { visibility: 'visible'}
          }, 'road_oneway'));
      }

      this.toggleLayerAnon(this.currentYear, true);

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

      if (this.getProfile.organismeCertificateurId) {
        get(`${API_ENDPOINT}/v1/summary`, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`
          }
        }).then(({ data }) => {
          this.organismeCertificateurOperators = data
          map.getSource("certification-body-operators").setData(data)
        })
      }
      else {
        this.organismeCertificateurOperators = null
        map.getSource("certification-body-operators").setData(geoJsonTemplate)
      }

      if (!map.getSource("operatorParcels2020")) {
        map.addSource("operatorParcels2020", {
          type: "geojson",
          data: this.parcelsOperator[2020]
        });
      }

      if (!map.getSource("operatorParcels2019")) {
        map.addSource("operatorParcels2019", {
          type: "geojson",
          data: this.parcelsOperator[2019]
        });
      }

      if (!map.getSource("operatorParcels2018")) {
        map.addSource("operatorParcels2018", {
          type: "geojson",
          data: this.parcelsOperator[2018]
        });
      }
      if (!map.getSource("operatorParcels2017")) {
        map.addSource("operatorParcels2017", {
          type: "geojson",
          data: this.parcelsOperator[2017]
        });
      }
    },

    flyTo({lat, lon, zoom}) {
      this.map.flyTo({
        center: [lat, lon],
        zoom,
      });
    },

    setOperator (operator) {
      const { numeroPacage:pacageId } = operator

      this.$store.commit("setOperator", operator)
      this.$router.push({
        name: 'mapWithPacage',
        params: {pacageId}
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
          this.zoomOnOperator();
        }
      }
    },

    closeOperatorDetailsSidebar () {
      this.map.resize()
      this.clearOperatorData()
      this.$router.replace({
        name: 'map',
        params: {}
      });
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
        this.zoomOnOperator();
      }

      this.isOperatorOnMap = true;

      // get the current operator
      if (getObjectValue(this.operator, "numeroPacage") && !getObjectValue(this.operator, "title")) {
        alert(
          "Le numéro de Pacage n'est pas pour le moment rattaché à un opérateur." +
            "Merci de faire la mise à jour du numéro pacage de l'opérateur sur le site https://notification.agencebio.org/"
        );
        this.operator.title = "pacage : " + this.operator.numeroPacage;
        this.filterLabel = { filter: "pacage", property: "numeroPacage" };
      }

      if (getObjectValue(this.operator, "numeroBio") || getObjectValue(this.operator, "numeroPacage")) {
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

        this.layersOperator["2020"] = this.getYearLayer(
          "2020",
          "rgba(98, 215, 113, 1)", // bio
          "rgba(253, 168, 212, 1)", // not bio
          "rgba(22, 154, 57, 1)" // outline
        );
        this.layersOperator["2019"] = this.getYearLayer(
          "2019",
          "rgba(31, 163, 65, 1)", // bio
          "rgba(227, 101, 157, 1)", // not bio
          "rgba(22, 154, 57, 1)" // outline
        );
        this.layersOperator["2018"] = this.getYearLayer(
          "2018",
          "rgba(0, 110, 27, 1)", // bio
          "rgba(179, 45, 100, 1)", // not bio
          "rgba(22, 154, 57, 1)" // outline
        );
        this.layersOperator["2017"] = this.getYearLayer(
          "2017",
          "rgba(0, 60, 0, 1)", // bio
          "rgba(116, 0, 50, 1)", // not bio
          "rgba(22, 154, 57, 1)" // outline
        );
      }

      this.years.forEach(year => {
        map.addLayer(this.layersOperator[year], 'road_oneway');
        map.addLayer({
          ...this.layersOperator[year],
          id: this.layersOperator[year].id + "-border",
          type: "line",
          paint: {
            "line-color": "rgba(255, 255, 255, 1)",
            "line-opacity": [
              'case',
              ['boolean', ['feature-state', 'highlighted'], false],
              1,
              0.65
            ],
            "line-width":[
              'case',
              ['boolean', ['feature-state', 'highlighted'], false],
               3,
               1
            ]
          }
        }, 'road_oneway');
      });
      this.toggleLayerOperator(this.currentYear, true);
    },

    hoverParcel (parcel) {
      const [lng, lat] = centroid(parcel.geometry.coordinates)
      this.hoveredParcelCoordinates = {lng, lat}

      this.buildHoveredPopup({lng, lat}, this.map.project({lng, lat}));
      this.highlightParcel(parcel);
    },

    stopHoveringParcel (parcel) {
      this.stopHighlightingParcel(parcel);

      this.hoveredParcelCoordinates = undefined
      this.hoveredParcelFeatures = {
        anon: [],
        operator: {},
        cadastre: null,
      }
    },

    highlightParcel(parcel) {
      this.map.setFeatureState({
        source: 'operatorParcels2020',
        id: parcel.id,
      }, { highlighted: true });
    },

    stopHighlightingParcel(parcel) {
      this.map.setFeatureState({
        source: 'operatorParcels2020',
        id: parcel.id,
      }, { highlighted: false });
    },

    hoverIlot({ numIlot, featureCollection }) {
      featureCollection.features.forEach((parcel) => {
        this.highlightParcel(parcel);
      });

      let ilotBbox = bboxPolygon(bbox(featureCollection));
      let ilotCenter = center(ilotBbox);
      let bboxMap = bboxPolygon(this.map.getBounds().toArray().flat());
      let inMap = isPointInPolygon(ilotCenter, bboxMap);
      if (!inMap) {
        this.hoveredIlotName = 'Ilot ' + numIlot;
        this.ilotCenterCoordinates = ilotCenter.geometry.coordinates;
        this.bboxMap = bboxMap;
        this.mapBounds = this.map.getBounds();
        this.mapCenter = this.map.getCenter().toArray();
        this.displayIlotDirection = true;
      }
    },

    stopHoveringIlot({ featureCollection }) {
      featureCollection.features.forEach((parcel) => {
        this.stopHighlightingParcel(parcel);
      });
      this.displayIlotDirection = false;
    },

    zoomOn(featureOrfeatureCollection) {
      this.map.fitBounds(bbox(featureOrfeatureCollection), {
        padding: this.mapPadding
      });
    },
    zoomOnOperator() {
      this.map.fitBounds(this.bboxOperator, {
        padding: this.mapPadding
      });
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

    clearOperatorData() {
      this.$store.commit("setOperator", {})

      this.years.forEach(year => {
        this.map.removeLayer(this.layersOperator[year].id);
        this.map.removeLayer(this.layersOperator[year].id + '-border');
        this.addOperatorData(geoJsonTemplate, year)
      })
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
      const {map} = this

      if (map && map.getLayer(layer)) {
        if (visibility) {
          map.setLayoutProperty(layer, 'visibility', 'visible');
          map.setLayoutProperty(layer + '-border', 'visibility', 'visible');
        } else {
          map.setLayoutProperty(layer, 'visibility', 'none');
          map.setLayoutProperty(layer + '-border', 'visibility', 'none');
        }
      }
    },
    displayErrorMessage(data) {
      console.error(data);
      alert("Impossible de trouver le parcellaire de cet opérateur");
    },
    // annual parcel layer
    getYearLayer(layerYear, colorBio, colorNotBio) {
      return {
        id: "operator-parcels-" + layerYear,
        type: "fill",
        source: "operatorParcels" + layerYear,
        paint: {
          "fill-color": [
            "match",
            ["to-number", ["get", "bio"]],
            0,
            colorNotBio,
            1,
            colorBio,
            "white"
          ],
          "fill-opacity": [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            1,
            0.6
          ]
        },
        layout : {
          visibility: "none"
        }
      };
    }
  },
  watch: {
    getProfile: function(newProfile) {
      // if the map is not yet loaded, it will load layers
      // best would be to populate layers data and make the data react to them
      if (newProfile.active && this.map) {
        this.loadLayers(this.map);
      }
    },
    operator: function(operator) {
      if (this.map && operator.id) {
        window._paq.push(['trackEvent', 'parcels', 'display-on-map', operator.numeroBio]);
        this.loadLayers(this.map);
        this.setUpMapOperator()
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
