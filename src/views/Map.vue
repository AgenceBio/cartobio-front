<template>
  <v-layout>
    <v-navigation-drawer app clipped stateless hide-overlay v-model="showSidebar">
      <router-view v-if="showOperator"
        :parcels="parcelsOperator[this.currentYear]"
        :operator="operator"
        v-on:zoom-on="zoomOn"
      />

      <SearchSidebar v-else-if="showSearch"
        :organismeCertificateur="getProfile.organismeCertificateur"
        :organismeCertificateurId="getProfile.organismeCertificateurId"
        @flyto="flyTo"
      />
    </v-navigation-drawer>

    <v-content>
      <!-- Map division so it takes the full width/height left -->
      <div class="map">
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
          <ParcelDetailsPopup
            :features="hoveredParcelFeatures"
            :coordinates="activeFeature && !activeFeature.trackPointer ? activeFeature.lngLat : undefined"
          />
          <ExploitationPopup
            :feature="hoveredExploitationFeature"
            :operator="certificationBodyOperators | byFeature(hoveredExploitationFeature, 'pacage')"
          />
          <IlotMarkerDirection
            v-if="displayIlotDirection"
            :ilotCenterCoordinates="ilotCenterCoordinates"
            :mapBounds="mapBounds"
            :bboxMap="bboxMap"
            :mapCenter="mapCenter"
            :hoveredIlotName="hoveredIlotName"
          />

          <MglGeojsonLayer
            v-if="isCertificationBody"
            before="place-continent"
            sourceId="certification-body-operators"
            layerId="certification-body-clusters-area"
            :layer="layerStyle('certification-body-clusters-area')"
          />
          <MglGeojsonLayer
            v-if="isCertificationBody"
            before="place-continent"
            sourceId="certification-body-operators"
            layerId="certification-body-clusters-count"
            :layer="layerStyle('certification-body-clusters-count')"
          />
          <MglVectorLayer
            v-if="isCadastreLayerSelectable"
            before="place-continent"
            sourceId="cadastre"
            layerId="selectable-cadastral-parcels"
            :layer="layerStyle('selectable-cadastral-parcels')" />
          <MglVectorLayer
            v-if="isCadastreLayerSelectable"
            before="selectable-cadastral-parcels"
            sourceId="cadastre"
            layerId="selectable-cadastral-parcels-area"
            :layer="layerStyle('selectable-cadastral-parcels-area')"
            @mousemove="hoverFeature"
            @click="toggleFeatureSelection" />
        </MglMap>

        <!-- Layers selector -->
        <LayersPanel v-if="isAuthenticated && operator.title"></LayersPanel>
      </div>
    </v-content>
  </v-layout>
</template>

<script>
import getObjectValue from "lodash/get";
import differenceBy from "lodash/differenceBy";
import { point, featureCollection } from "@turf/helpers";
import bboxPolygon from "@turf/bbox-polygon";
import bbox from "@turf/bbox";
import centroid from "@turf/centroid";
import { all as mergeAll } from "deepmerge";
import isPointInPolygon from "@turf/boolean-point-in-polygon";
// import intersect from '@turf/intersect';
import combine from '@turf/combine';
import difference from '@turf/difference';
import union from '@turf/union';
import {featureEach} from "@turf/meta";

import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglScaleControl,
  MglGeojsonLayer,
  MglVectorLayer,
} from "vue-mapbox";

import {
  baseStyle,
  cadastreStyle,
  cartobioStyle,
  infrastructureStyle,
} from "@/assets/styles/index.js";
import ParcelDetailsPopup from "@/components/ParcelDetailsPopup";
import ExploitationPopup from "@/components/ExploitationPopup";
import SearchSidebar from "@/components/Map/SearchSidebar";
import IlotMarkerDirection from "@/components/IlotMarkerDirection";
import LayersPanel from "@/components/Map/LayersPanel";

import { mapGetters, mapState, mapMutations, mapActions } from "vuex";

function queryOperatorParcels(operatorParcels, [lng, lat]) {
  const p = point([lng, lat]);

  return Object.entries(operatorParcels).reduce(
    (hashMap, [year, { features }]) => {
      const foundFeature = features.find((feature) =>
        isPointInPolygon(p, feature.geometry)
      );

      return foundFeature ? { ...hashMap, [year]: foundFeature } : hashMap;
    },
    {}
  );
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

// template for geoJSON objects
let geoJsonTemplate = featureCollection([]);
const noop = function noop() {};

export default {
  name: "Map",

  metaInfo () {
    return {
      title: `Parcellaire bio ${this.getProfile?.organismeCertificateur.nom}`
    }
  },

  components: {
    ParcelDetailsPopup,
    ExploitationPopup,
    SearchSidebar,
    MglNavigationControl,
    MglGeolocateControl,
    MglScaleControl,
    MglMap,
    IlotMarkerDirection,
    LayersPanel,
    MglGeojsonLayer,
    MglVectorLayer
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
        { sources: cartobioStyle.sources },
      ]),

      showSidebar: true,

      // anonymous layers
      anonLayers: {},

      // operator parcels by year
      parcelsOperator: {
        2020: geoJsonTemplate,
        2019: geoJsonTemplate,
        2018: geoJsonTemplate,
        2017: geoJsonTemplate,
      },
      // highlighted parcels (hovered in list)
      highlightedParcels: geoJsonTemplate,
      // selected parcels
      selectedParcels: geoJsonTemplate,
      // bbox containing operator parcels
      bboxOperator: [],

      // popup data with parcel history
      hoveredExploitationFeature: undefined,
      hoveredParcelFeatures: {
        anon: [],
        operator: {},
        cadastre: null,
      },

      // placeholder for layers for an operator
      layersOperator: {},

      highlightedParcel: null,

      // hovered ilot direction
      hoveredIlotName: "",
      bboxMap: {},
      mapCenter: [],
      mapBounds: {},
      ilotCenterCoordinates: [],
      displayIlotDirection: false,

      layersVisible: {
        // https://gka.github.io/palettes/#/9|d|169a39|ac195e|1|1
        2020: {
          visibility: false,
          colorBio: "rgba(98, 215, 113, 1)",
          colorNotBio: "rgba(253, 168, 212, 1)",
        },
        2019: {
          visibility: false,
          colorBio: "rgba(31, 163, 65, 1)",
          colorNotBio: "rgba(227, 101, 157, 1)",
        },
        2018: {
          visibility: false,
          colorBio: "rgba(0, 110, 27, 1)",
          colorNotBio: "rgba(179, 45, 100, 1)",
        },
        2017: {
          visibility: false,
          colorBio: "rgba(0, 60, 0, 1)",
          colorNotBio: "rgba(116, 0, 50, 1)",
        },
        anon2020: { visibility: false, color: "#A6DC9A" },
        anon2019: { visibility: false, color: "rgba(208, 211, 46, 1)" },
        anon2018: { visibility: false, color: "rgba(208, 211, 46, 1)" },
        anon2017: { visibility: false, color: "rgba(208, 211, 46, 1)" },
      },
      // list of years in CartoBio. Need to find a more automated way to get this for the future.
      // Also indirect impact on layersVisible and parcelsOperator
      // layers display in the order of years : last year in this array on top
      years: [2017, 2018, 2019, 2020],
    };
  },
  // event bus
  props: {
    numeroBio: {
      type: Number,
      default: null,
    },
    latLonZoom: {
      type: String,
      default: "@46.874,3.097,5",
    },
  },
  created: function () {
    this.map = null;

    const [, lat, lon, zoom] = this.latLonZoom.match(
      /@([0-9.-]+),([0-9.-]+),(\d+)/
    );

    this.zoom = Number(zoom);
    this.center = [Number(lon), Number(lat)];

    this._operatorsP = this.$store.dispatch("operators/FETCH_OPERATORS")
  },
  computed: {
    // @see https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper
    ...mapGetters(["getProfile"]),
    ...mapGetters("user", ["isAuthenticated", "isCertificationBody"]),
    ...mapGetters("map", ["activeFeature", "activeFeatures"]),
    ...mapGetters({
      operator: "operators/currentOperator",
      findOperatorByPacage: "operators/findByPacage",
    }),
    // ...mapGetters("exploitationView", ["exploitationView"]),
    ...mapState("exploitationView", ["exploitationView"]),
    ...mapState("user", ["apiToken"]),
    ...mapState(["currentYear"]),
    ...mapState("operators", ["certificationBodyOperators"]),
    ...mapState("map", ["isCadastreLayerSelectable"]),

    showOperator() {
      return Boolean(this.isAuthenticated && this.operator.id);
    },

    showSearch() {
      return Boolean(this.isAuthenticated && !this.operator.id);
    },

    // to display the years in right order in the layers panel
    sortedYears() {
      let yearsArr = this.years.slice();
      return yearsArr.reverse();
    },
  },

  filters: {
    byFeature(geojson, filteringFeature, propertyName) {
      if (!geojson.features || !filteringFeature) {
        return null;
      }

      return (geojson.features || []).find(
        ({ properties }) =>
          properties[propertyName] === filteringFeature.properties[propertyName]
      );
    },
  },

  methods: {
    ...mapMutations({
      clearActiveParcel: "map/CLEAR_HOVERED_FEATURE",
      setActiveParcel: "map/HOVERED_FEATURE",
    }),

    ...mapActions("user", ["trackEvent"]),

    /**
     * @param  {String} styleId [description]
     * @return {Object<Mapbox.Layer>}
     */
    layerStyle(styleId) {
      return cartobioStyle.layers.find(({ id }) => id === styleId);
    },

    /*https://soal.github.io/vue-mapbox/guide/basemap.html#map-actions
     May be usefull to handle promise and avoid the mess it is right now for map init
   */
    onMapLoaded({ map }) {
      // for future reference in events
      // ideally, it would be ideal to stop referencing `this.map` and deal with a pure component instead
      this.map = map;

      // this.updateHash(map);
      map.on("moveend", () => this.trackEvent(["map", "move"]));
      // map.on("zoomend", () => this.updateHash(map));

      // add map sources
      if (this.isAuthenticated) {
        this.loadLayers(map);
        this.setupCertificationBodyLayers(map);

        if (this.numeroBio) {
          this.trackEvent(["operator", "select", "via:refresh"])
          this.$store.commit("operators/SET_CURRENT", parseInt(this.numeroBio));
        }
      }

      map.on("mousemove", ({ lngLat }) => {
        const { currentYear, activeFeature } = this;
        const { lng, lat } = lngLat;

        // @todo this is possibly an issue if we hover a feature, which exists in the past, but not on currentYear
        let { [currentYear]: feature } = queryOperatorParcels(
          { [currentYear]: this.parcelsOperator[currentYear] },
          [lng, lat]
        );

        // we go for anonymous layers if there was no operator features found
        if (!feature) {
          const point = this.map.project(lngLat);
          const renderedFeatures = this.map.queryRenderedFeatures(point);
          feature = renderedFeatures.filter(
            ({ sourceLayer, layer }) =>
              layer.type === "fill" &&
              sourceLayer &&
              sourceLayer.indexOf("anon_") === 0
          )[0];
        }

        // it is a bit ugly, but it avoids overloading the store with events
        // maybe we should consider throttling the function instead?
        if (feature && feature.id !== activeFeature?.feature.id) {
          this.setActiveParcel({ feature, lngLat, trackPointer: true });
        } else if (!feature && activeFeature?.feature.id) {
          this.clearActiveParcel();
        }
      });

      map.on("click", "certification-body-parcels-points", (e) => {
        const { pacage } = e.features[0].properties;
        const operator = this.findOperatorByPacage(pacage);
        const {numerobio:numeroBio} = operator.properties;

        this.trackEvent(["operator", "select", "via:map"])
        this.$store.commit("operators/SET_CURRENT", numeroBio);
        this.$router.push({ path: `/map/exploitation/${numeroBio}` })
      });

      map.on("click", "certification-body-clusters-area", (e) => {
        const { coordinates: center } = e.features[0].geometry;
        const { cluster_id: id } = e.features[0].properties;

        // we zoom directly to where the cluster dissolves
        // if it's a tiny cluster, we will zoom deep (but at max level 10)
        // if it's a large cluster, we will zoom at a level it splits in at least 2 other clusters
        map
          .getSource("certification-body-operators")
          .getClusterExpansionZoom(id, (error, newZoom) => {
            const zoom = Math.min(10, newZoom)

            this.trackEvent(["map", "cluster-zoom", zoom])
            map.flyTo({ center, zoom });
          });
      });

      function setupHoverFor({
        map,
        source,
        sourceLayer = null,
        layer,
        onHover = noop,
        onBlur = noop,
      }) {
        // handle summary interactions
        // because it happens over a cluster, we can count on having 1 feature only
        let hoveredFeatureId = null;

        map.on("mousemove", layer, (e) => {
          const { id } = e.features[0];
          onHover({ features: e.features });
          map.getCanvas().style.cursor = "pointer";

          // sometimes, mouseleave is fired after we hover another feature/cluster
          if (hoveredFeatureId) {
            map.setFeatureState(
              { id: hoveredFeatureId, source, sourceLayer },
              { hover: false }
            );
          }

          this.trackEvent(["map", `${source}-hover`])
          map.setFeatureState({ id, source, sourceLayer }, { hover: true });
          hoveredFeatureId = id;
        });

        map.on("mouseleave", layer, () => {
          const id = hoveredFeatureId;
          map.getCanvas().style.cursor = "";

          onBlur();
          map.setFeatureState({ id, source, sourceLayer }, { hover: false });
          hoveredFeatureId = null;
        });
      }

      setupHoverFor({
        layer: "certification-body-clusters-area",
        source: "certification-body-operators",
        map,
      });

      setupHoverFor({
        layer: "certification-body-parcels-points",
        source: "certification-body-parcels",
        sourceLayer: "rpgbio_points_2019",
        onHover: ({ features }) =>
          (this.hoveredExploitationFeature = features[0]),
        onBlur: () => (this.hoveredExploitationFeature = undefined),
        map,
      });

      // handle click on layers
      if (this.operator.title && !this.isOperatorOnMap) {
        this.setUpMapOperator();
      }

      // we force reload operator layers when it gets assigned a new PACAGE
      this.$store.subscribe((mutation) => {
        if (mutation.type === "operators/MERGE_OPERATOR") {
          this.setUpMapOperator();
        }
      });

      // a components asks to zoom on a Feature or on a FeatureCollection
      this.$store.subscribeAction((action) => {
        if (action.type === "map/zoomOn") {
          this.trackEvent(["operator", "view-parcel", "via:zoom-icon"])
          this.zoomOn(action.payload);
        }
      });
    },

    hoverFeature ({ component, map, mapboxEvent }) {
      const {point} = mapboxEvent
      const [source, sourceLayer]= [component.layer.source, component.layer['source-layer']]

      const currentlyHoveredFeatures = component.getRenderedFeatures().filter(({ state }) => state.hover === true)
      const hoveredFeatures = component.getRenderedFeatures(point)

      // we "blur" other
      differenceBy(currentlyHoveredFeatures, hoveredFeatures, 'id').forEach(({ id }) => {
        map.setFeatureState({ source, sourceLayer, id }, { 'hover': false })
      })

      hoveredFeatures.forEach(({ id, state }) => {
        if (state.selected === true) {
          map.getCanvas().style.cursor = 'not-allowed'
        }
        else {
          map.getCanvas().style.cursor = 'copy'
        }

        // buggy as of https://github.com/soal/vue-mapbox/pull/209
        // will need a workaround by calling map.setFeatureState() directly
        // component.setFeatureState(feature.id, { 'hover': true })
        map.setFeatureState({ source, sourceLayer, id }, { 'hover': true })
      })
    },

    sameFeatureId(featureA, featureB) {
      console.log(featureA.properties.id);
      console.log(featureB);
      return featureA.properties.id === featureB.properties.id
    },
    toggleFeatureSelection ({ component, map, mapboxEvent }) {
      const {point} = mapboxEvent

      component.getRenderedFeatures(point).forEach(feature => {
        const { id, state } = feature
        const selected = !state.selected
        const [source, sourceLayer]= [component.layer.source, component.layer['source-layer']]

        map.setFeatureState({ source, sourceLayer, id }, { selected })

        // prevent selection of cadastral parcel overlapping with operator parcel
        let diff = null;
        let intersection = null;
        let allFeaturesIds = map.querySourceFeatures(source, {sourceLayer : sourceLayer, filter : ['==', 'id', feature.properties.id]});
        let cadastralFeature = allFeaturesIds[0];
        
        featureEach({type : 'FeatureCollection', features : allFeaturesIds}, function(currentFeature, featureIndex) {
          if (featureIndex > 0) {
            cadastralFeature = union(cadastralFeature, currentFeature);
          }
        });
        console.log(cadastralFeature);
        // intersection = intersect();

        console.log(intersection);
        let combinedFeatures = combine(this.parcelsOperator[this.currentYear]);
        diff = difference(cadastralFeature, combinedFeatures.features[0]);
        // this.map.addLayer
        
        map.getSource('parcels-to-add').setData(diff);
        if (!this.map.getLayer('new-parcels')) {
          this.map.addLayer({
            'id': 'new-parcels',
            'type': 'fill',
            'source': 'parcels-to-add',
            'layout': {},
            'paint': {
              'fill-color': '#088',
              'fill-opacity': 0.8
              }
          })
        }
        this.$store.commit('map/FEATURE_TOGGLE', {
          state: { selected },
          feature: JSON.parse(JSON.stringify(diff)),
          source : 'parcels-to-add',
          layer : 'new-parcels'
        })
      })
    },

    computeParcelHistoryFromLngLat({ lngLat }) {
      const point = this.map.project(lngLat);
      const renderedFeatures = this.map.queryRenderedFeatures(point);

      this.hoveredParcelFeatures = {
        // anonymous source layers are named like 'anon_..._20xx'
        anon: renderedFeatures.filter(
          ({ sourceLayer }) => sourceLayer && sourceLayer.indexOf("anon_") === 0
        ),
        operator: queryOperatorParcels(this.parcelsOperator, lngLat),
        cadastre: renderedFeatures.find(
          ({ source, layer }) => layer.type === "fill" && source === "cadastre"
        ),
      };
    },

    updateHash(map) {
      const { lat, lng } = map.getCenter();
      const zoom = Math.floor(map.getZoom());

      const { numeroBio } = this;
      const latLonZoom = `@${lat},${lng},${zoom}`;

      this.$router
        .replace({
          name: "map",
          params: { numeroBio, latLonZoom },
        })
        .catch((error) => {
          // we can safely ignore duplicate navigation
          // as I do not know if I can predict the upcoming url
          if (error.name !== "NavigationDuplicated") {
            console.error(error);
          }
        });
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
              process.env.VUE_APP_GEOSERVER_SUFFIX,
          ],
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
              "fill-color": "#A6DC9A",
              "fill-opacity": 0.6,
            },
            tms: true,
            maxzoom: 24,
            layout: { visibility: "none" },
          };
          this.anonLayers[year] = bioLayer;
          map.addLayer(this.anonLayers[year], "road_oneway");
          map.addLayer(
            {
              id: `bio-tiles-${year}-border`,
              type: "line",
              source: "bio-" + year,
              "source-layer": "anon_rpgbio_" + year,
              minzoom: 10,
              paint: {
                "line-color": "#A6DC9A",
                "line-opacity": 1,
                "line-width": {
                  stops: [
                    [9, 0],
                    [12, 1],
                  ],
                },
              },
              layout: { visibility: "none" },
            },
            "road_oneway"
          );
        }
      });

      // non-bio
      if (!map.getLayer("rpg-anon-nonbio-2020")) {
        cartobioStyle.layers
          .filter(({ id }) => id.indexOf("rpg-anon-nonbio") === 0)
          .forEach((layer) => map.addLayer(layer, "road_oneway"));
      }

      if (!map.getLayer("certification-body-parcels-points")) {
        cartobioStyle.layers
          .filter(({ id }) => id === "certification-body-parcels-points")
          .forEach((layer) => map.addLayer(layer, "road_oneway"));
      }

      if (!map.getSource("selected")) {
        map.addSource("selected", {
          type: "geojson",
          data: this.selectedParcels,
        });
      }
      if (!map.getSource("parcels-to-add")) {
        map.addSource("parcels-to-add", {
          type: "geojson",
          data : geoJsonTemplate
        });
      }
      if (!map.getSource("highlight")) {
        map.addSource("highlight", {
          type: "geojson",
          data: this.highlightedParcels,
        });
      }

      if (!map.getSource("operatorParcels2020")) {
        map.addSource("operatorParcels2020", {
          type: "geojson",
          data: this.parcelsOperator[2020],
        });
      }

      if (!map.getSource("operatorParcels2019")) {
        map.addSource("operatorParcels2019", {
          type: "geojson",
          data: this.parcelsOperator[2019],
        });
      }

      if (!map.getSource("operatorParcels2018")) {
        map.addSource("operatorParcels2018", {
          type: "geojson",
          data: this.parcelsOperator[2018],
        });
      }
      if (!map.getSource("operatorParcels2017")) {
        map.addSource("operatorParcels2017", {
          type: "geojson",
          data: this.parcelsOperator[2017],
        });
      }
    },

    flyTo({ lat, lon, zoom }) {
      this.map.flyTo({
        center: [lat, lon],
        zoom,
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

    closeOperatorDetailsSidebar() {
      this.map.resize();

      this.years.forEach((year) => {
        this.map.removeLayer(this.layersOperator[year].id);
        this.map.removeLayer(this.layersOperator[year].id + "-border");
        this.addOperatorData(geoJsonTemplate, year);
      });

      this.$router.replace({
        name: "map",
        params: {},
      });
    },

    unsetUpMapOperator() {
      this.map.setLayoutProperty(
        "certification-body-parcels-points",
        "visibility",
        "visible"
      );

    },

    setupCertificationBodyLayers(map) {
      if (!map || !this.isCertificationBody) {
        return;
      }

      const operatorsP = this._operatorsP

      operatorsP.then(({ data }) => {
        map.getSource("certification-body-operators").setData(data);
      });

      operatorsP.then(({ data }) => {
        const pacageList = data.features
          .filter(({ properties }) => properties.pacage)
          .map(({ properties }) => properties.pacage);

        map.setFilter("certification-body-parcels-points", [
          "in",
          "pacage",
          ...pacageList,
        ]);
      });
    },

    setUpMapOperator() {
      const { map } = this;

      if (
        this.bboxOperator[0] !== undefined &&
        this.bboxOperator[0] !== Infinity
      ) {
        this.zoomOnOperator();
      }

      this.isOperatorOnMap = true;

      if (
        getObjectValue(this.operator, "numeroBio") ||
        getObjectValue(this.operator, "numeroPacage")
      ) {
        const { numeroPacage } = this.operator;
        const params = {
          numeroPacage,
          years: [2020, 2019, 2018, 2017],
        };

        this.$store
          .dispatch("operators/FETCH_WFS_LAYERS", params)
          .then((dataPerYear) => {
            dataPerYear.forEach(([year, data]) => {
              year === this.currentYear
                ? this.displayOperatorLayer(data)
                : this.addOperatorData(data, year);
            });
          });

        this.layersOperator["2020"] = this.getYearLayer(
          "2020",
          "#B9D065", // bio
          "#47718A", // not bio
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

      this.years.forEach((year) => {
        map.addLayer(this.layersOperator[year], "road_oneway");
        map.addLayer(
          {
            ...this.layersOperator[year],
            id: this.layersOperator[year].id + "-border",
            type: "line",
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "highlighted"], false],
                "rgba(0, 204, 255, 1)",
                "rgba(255, 255, 255, 1)",
              ],
              "line-opacity": 1,
              "line-width": 3,
            },
          },
          "road_oneway"
        );
      });

      this.map.setLayoutProperty(
        "certification-body-parcels-points",
        "visibility",
        "none"
      );

      this.toggleLayerOperator(this.currentYear, true);
    },

    /**
     * Set the Mapbox feature state for a featureCollection
     *
     * @param {FeatureCollection} featureCollection
     * @param {{ highlighted: boolean }} state
     */
    setFeatureState(featureCollection, state) {
      const source = `operatorParcels${this.currentYear}`;

      featureCollection.features.forEach(({ id }) => {
        this.map.setFeatureState({ source, id }, state);
      });
    },

    setupIlotDirection({ numIlot, featureCollection }) {
      const ilotBbox = bboxPolygon(bbox(featureCollection));
      const ilotCenter = centroid(ilotBbox);
      const bboxMap = bboxPolygon(this.map.getBounds().toArray().flat());
      const inMap = isPointInPolygon(ilotCenter, bboxMap);

      if (!inMap) {
        this.hoveredIlotName = `Ilot ${numIlot}`;
        this.ilotCenterCoordinates = ilotCenter.geometry.coordinates;
        this.bboxMap = bboxMap;
        this.mapBounds = this.map.getBounds();
        this.mapCenter = this.map.getCenter().toArray();
        this.displayIlotDirection = true;
      }
    },

    zoomOn(featureOrfeatureCollection) {
      this.map.fitBounds(bbox(featureOrfeatureCollection), {
        padding: this.mapPadding,
      });
    },

    /**
     * @todo remove it, and replace it with the more generic `zoomOn()` method
     */
    zoomOnOperator() {
      this.map.fitBounds(this.bboxOperator, {
        padding: this.mapPadding,
      });
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
      const { map } = this;

      if (map && map.getLayer(layer)) {
        if (visibility) {
          map.setLayoutProperty(layer, "visibility", "visible");
          map.setLayoutProperty(layer + "-border", "visibility", "visible");
        } else {
          map.setLayoutProperty(layer, "visibility", "none");
          map.setLayoutProperty(layer + "-border", "visibility", "none");
        }
      }
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
            "white",
          ],
          "fill-opacity": 1,
        },
        layout: {
          visibility: "none",
        },
      };
    },
  },
  watch: {
    getProfile: function (newProfile, previousProfile) {
      // if the map is not yet loaded, it will load layers
      // best would be to populate layers data and make the data react to them
      if (this.isAuthenticated && this.map) {
        this.loadLayers(this.map);
        this.setupCertificationBodyLayers(this.map);
      }
      // user logs out
      else if ((!newProfile || !newProfile.active) && this.map) {
        this.map.removeLayer("certification-body-parcels-points");

        // user logs out, and is part of a certification body
        if (previousProfile.organismeCertificateurId) {
          this.map
            .getSource("certification-body-operators")
            .setData(geoJsonTemplate);
        }
      }
    },
    operator(operator, previousOperator) {
      if (this.map) {
        if (operator.id && operator.id !== previousOperator.id) {
          this.loadLayers(this.map);
          this.setUpMapOperator();
        } else if (!operator.id && previousOperator.id) {
          this.unsetUpMapOperator();
          this.closeOperatorDetailsSidebar();
        }
      }
    },

    activeFeature(activeFeature, previousFeature) {
      if (activeFeature) {
        const { feature, lngLat } = activeFeature;

        if (previousFeature && previousFeature.feature.id !== feature.id) {
          this.setFeatureState(featureCollection([previousFeature.feature]), {
            highlighted: false,
          });
        }

        this.setFeatureState(featureCollection([feature]), {
          highlighted: true,
        });

        if (lngLat) {
          this.computeParcelHistoryFromLngLat({ lngLat });
        }
      } else if (!activeFeature && previousFeature) {
        this.setFeatureState(featureCollection([previousFeature.feature]), {
          highlighted: false,
        });
        this.hoveredParcelFeatures = {
          anon: [],
          operator: {},
          cadastre: null,
        };
      }
    },
    exploitationView (newView) {
      this.toggleLayerAnon(this.currentYear, newView === 0);
      this.toggleLayer("rpg-anon-nonbio-2020", newView === 0);

      this.years.forEach((year) => {
        if (year !== this.currentYear) {
          this.toggleLayerOperator(year, newView === 1);
        }
      })
    },
    activeFeatures(activeFeatures, previousFeatures) {
      if (activeFeatures) {
        const { featureCollection, numIlot } = activeFeatures;
        this.setFeatureState(featureCollection, { highlighted: true });
        this.setupIlotDirection({ featureCollection, numIlot });
      } else if (previousFeatures) {
        const { featureCollection } = previousFeatures;
        this.setFeatureState(featureCollection, { highlighted: false });
        this.displayIlotDirection = false;
      }
    },
  },
};
</script>

<style lang="scss">
@import "~mapbox-gl/dist/mapbox-gl.css";
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
