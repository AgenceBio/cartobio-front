<template>
  <div class="pop-in-top" v-if="!showRPGModal && !showCadastreModal">
    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      :class="[mode === 'dessiner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
      @click="mode = 'dessiner'"
      aria-label="Accéder au mode dessin"
    >
      <i class="ri-pen-nib-line fr-mr-1w" aria-hidden="true" />
      Dessiner
    </button>
    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Accéder au mode Cadastre"
      :class="[mode === 'cadastre' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
      @click="mode = 'cadastre'"
    >
      <i class="ri-collage-line fr-mr-1w" aria-hidden="true" />
      Cadastre
    </button>
    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Accéder au mode RPG"
      :class="[mode === 'RPG' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
      @click="mode = 'RPG'"
    >
      <i class="ri-collage-line fr-mr-1w" aria-hidden="true" />
      RPG
    </button>
    <div class="vr" />
    <button
      class="fr-btn fr-btn--sm fr-icon-close-line fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Quitter le mode dessin"
      @click="quitDraw"
    ></button>
  </div>
  <div class="pop-in-info-cadastre close fr-pl-2w" v-if="mode === 'cadastre'">
    <CommuneSelect class="fr-mt-1v" @feature="(e) => zoomCommune(e)" v-model="selectedCommune" />
    <button
      class="fr-btn fr-icon-pencil-line fr-btn--icon-left fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Saisir les references cadastrales"
      @click="showModalCadastre = true"
    >
      Saisir une référence cadastrale
    </button>
  </div>

  <div v-if="invalidDrawing" class="pop-in-info close">
    <div class="title fr-mr-2v">
      <i class="ri-pen-nib-line" aria-hidden="true" />
      <strong class="fr-ml-1v">Dessiner</strong>
    </div>
    <p class="fr-mb-0 fr-text--xs title" role="alert">Votre parcelle a été rogner pour respecter les règles</p>
    <button
      class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-check-line fr-btn--icon-right fr-btn--sm"
      aria-label="Valider le dessin"
      @click="confirmCorrection"
    >
      Valider
    </button>
    <button
      class="fr-btn fr-btn--sm fr-icon-close-line fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Annuler le dessin"
      @click="cancelDraw"
    ></button>
  </div>
  <div v-if="errorDrawing && !invalidDrawing" class="pop-in-top">
    <p class="fr-mb-0" role="alert">Votre parcelle est invalide. Veuillez recommencer.</p>
    <button
      class="fr-btn fr-btn--sm fr-icon-close-line fr-btn--tertiary-no-outline"
      aria-label="Annuler le dessin"
      @click="cancelDraw"
    ></button>
  </div>
  <div v-if="errorDrawing && !invalidDrawing" class="pop-in-top">
    <p class="fr-mb-0" role="alert">Votre parcelle est invalide. Veuillez recommencer.</p>
    <button
      class="fr-btn fr-btn--sm fr-icon-close-line fr-btn--tertiary-no-outline"
      aria-label="Annuler le dessin"
      @click="cancelDraw"
    ></button>
  </div>

  <div v-if="showCadastreModal && mode === 'cadastre'" class="pop-in-top">
    <p class="fr-mb-0">
      {{ selectedIds.length }} parcelle<span v-if="selectedIds.length > 1">s</span> sélectionnée<span
        v-if="selectedIds.length > 1"
        >s</span
      >
    </p>
    <button
      class="fr-btn fr-btn--sm fr-icon-check-line fr-btn--icon-right"
      aria-label="Ajouter les parcelles cadastrales"
      @click="addCadastreFeatures"
    >
      Ajouter
    </button>
    <button
      class="fr-btn fr-icon-close-line fr-btn--sm fr-btn--tertiary-no-outline"
      aria-label="Annuler les parcelles cadastrales"
      @click="
        () => {
          selectedIds = [];
          previewSource.clear();
          showCadastreModal = false;
        }
      "
    />
  </div>

  <div v-if="showRPGModal && mode === 'RPG'" class="pop-in-top">
    <p class="fr-mb-0">
      {{ selectedIds.length }} parcelle<span v-if="selectedIds.length > 1">s</span> sélectionnée<span
        v-if="selectedIds.length > 1"
        >s</span
      >
    </p>
    <button
      class="fr-btn fr-btn--sm fr-icon-check-line fr-btn--icon-right"
      aria-label="Ajouter les parcelles RPG"
      @click="addRpgFeatures"
    >
      Ajouter
    </button>
    <button
      class="fr-btn fr-icon-close-line fr-btn--sm fr-btn--tertiary-no-outline"
      @click="
        () => {
          selectedIds = [];
          previewSource.clear();
          showRPGModal = false;
        }
      "
    />
  </div>

  <Teleport to="body">
    <AddParcelleModal
      v-if="showDetailsModal && feature"
      :feature="feature"
      @close="goToEdit"
      @submit="submitFeature"
      icon="fr-icon-add-line"
      :data-content-name="'Modale de confirmation d\'ajout'"
      required-name
    >
      <template #title>Nouvelle parcelle</template>
    </AddParcelleModal>

    <CadastreFieldModal
      v-if="showModalCadastre"
      :commune="selectedCommune"
      @close="showModalCadastre = false"
      @feature="(e) => addParcelleCadastraleModal(e)"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, createApp, nextTick, Ref, inject } from "vue";

import { Map, MapBrowserEvent } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, RegularShape } from "ol/style";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { useRecordStore } from "@/stores/record.js";

import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { addParcelleVerif, submitNewParcelle } from "@/cartobio-api.js";

import AddParcelleModal from "@/components/forms/AddParcelleModal.vue";
import CommuneSelect from "@/components/forms/fields/CommuneSelect.vue";
import CadastreFieldModal from "@/components/forms/fields/CadastreFieldModal.vue";
import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Draw } from "ol/interaction";
import Tooltip from "ol-ext/overlay/Tooltip";
import { MultiPoint } from "ol/geom";
import { DrawEvent } from "ol/interaction/Draw";
import NewParcelleTooltip from "../Overlays/NewParcelleTooltip.vue";
import { storeToRefs } from "pinia";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { FeatureCollection } from "@turf/helpers";
import intersect from "@turf/intersect";
import kinks from "@turf/kinks";
import axios from "axios";

/*
 * * Interface
 */

interface Props {
  map: Map;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  recordId: string;
}

/*
 * * Props
 */

const props = defineProps<Props>();

/*
 * * Stores
 */
const recordStore = useRecordStore();

const store = useFeaturesStore();
const preferences = usePreferences();

const { layers: mapLayers, params: mapParams } = storeToRefs(preferences);

/*
 * * Refs
 */

const showDetailsModal = ref(false);
const feature = ref<Feature | null>(null);
const correctedFeature = ref<Feature | null>(null);
const mode = ref<"dessiner" | "cadastre" | "RPG" | null>(null);

const loading: Ref<boolean> = inject("loading", ref(false));

// Refs draw interaction
const invalidDrawing = ref<boolean>(false);
const errorDrawing = ref<boolean>(false);

let draw: Draw | null = null;
let sourceLayer: VectorTileLayer<VectorTileSource> | null = null;
const selectedIds = ref<string[]>([]);

let cadastre: boolean | null = null;
let rpg: boolean | null = null;

const showCadastreModal = ref(false);
const showRPGModal = ref(false);

const selectedCommune = ref(null);
const showModalCadastre = ref(false);
/*
 * * Constantes
 */

const previewStyle = new Style({
  stroke: new Stroke({
    color: "rgba(139, 248, 231, 1)",
    width: 3,
    lineDash: [10, 5],
  }),
  fill: new Fill({
    color: "rgba(8, 41, 67, 0.7)",
  }),
});

const errorStyle = new Style({
  stroke: new Stroke({
    color: "rgba(255, 0, 0, 1)",
    width: 3,
    lineDash: [10, 5],
  }),
  fill: new Fill({
    color: "rgba(255, 0, 0, 0.3)",
  }),
});

const previewSource = new VectorSource();
const previewLayer = new VectorLayer({
  source: previewSource,
  style: previewStyle,
  zIndex: 3,
});

/*
 * * Fonctions :  interactions
 */

const clearPreviewSource = (): void => {
  const features = previewLayer.getSource()?.getFeatures();
  if (!features) {
    return;
  }

  features.forEach((feat) => {
    previewLayer.getSource()?.removeFeature(feat);
  });
};

const cancelDraw = (): void => {
  clearPreviewSource();
  invalidDrawing.value = false;
  errorDrawing.value = false;
  correctedFeature.value = null;
};

const confirmCorrection = (): void => {
  if (correctedFeature.value) {
    feature.value = correctedFeature.value;
    feature.value.id = 1;
    feature.value.properties.isCertified = recordStore.record.certification_state === "CERTIFIED";
    feature.value.properties.cultures = [{ CPF: "", id: crypto.randomUUID() }];
  }
};

const createStyles = () => {
  const fillColor = "rgba(74, 140, 190, 0.3)";
  const borderColor = "rgba(139, 248, 231, 1)";

  const styleDrawing = new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ width: 3, color: borderColor }),
  });

  const stylePointDrawing = new Style({
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    geometry: (e: Feature) => {
      const coords = e.getGeometry()?.getCoordinates()?.[0];
      if (coords?.length) return new MultiPoint(coords);
    },
  });

  const snapStyle = new Style({
    stroke: new Stroke({ color: "#ff3333", width: 2, lineDash: [5, 5] }),
    fill: new Fill({ color: "rgba(255, 51, 51, 0.1)" }),
  });

  return { styleDrawing, stylePointDrawing, snapStyle };
};

const createTooltipContent = (feature: Feature) => {
  const area = calculateArea(new GeoJSON().writeFeatureObject(feature, {}) as CartoBioFeature);
  const element = document.createElement("div");

  const app = createApp(NewParcelleTooltip, {
    area,
  });

  app.mount(element);
  return element.innerHTML;
};

const handleTracing = (
  e: MapBrowserEvent,
  currentDrawing: Feature | null,
  snapStyle: Style,
  snapFeatureRef: { current: Feature | null },
) => {
  if (!currentDrawing) return;

  const coordinate = e.coordinate;
  const pixel = props.map.getPixelFromCoordinate(coordinate);

  const features = props.map.getFeaturesAtPixel(pixel, {
    layerFilter: (layer) => layer === props.vectorLayer,
    hitTolerance: 10,
  });

  if (snapFeatureRef.current) {
    props.vectorSource.removeFeature(snapFeatureRef.current);
    snapFeatureRef.current = null;
  }

  if (features.length > 0 && features[0] !== currentDrawing) {
    const targetFeature = features[0];
    const targetGeom = targetFeature.getGeometry();

    if (targetGeom) {
      snapFeatureRef.current = new Feature({ geometry: targetGeom.clone() });
      snapFeatureRef.current.setStyle(snapStyle);
      props.vectorSource.addFeature(snapFeatureRef.current);
    }
  }
};

const handleClickCadastre = async (e: MapBrowserEvent) => {
  const features = await sourceLayer?.getFeatures(e.pixel);

  if (!features || features.length === 0) {
    return;
  }

  const cadastreFeature = features[0];

  if (cadastreFeature) {
    const properties = cadastreFeature.getProperties();

    if (selectedIds.value.includes(properties.id)) {
      const feature = previewSource.getFeatureById(properties.id);

      if (feature) {
        previewSource.removeFeature(feature);
      }
      selectedIds.value = selectedIds.value.filter((s) => s != properties.id);

      return;
    }
    let featureCollection: FeatureCollection;
    try {
      // @see https://geoservices.ign.fr/documentation/services/services-geoplateforme/geocodage
      featureCollection = (
        await axios.get("https://data.geopf.fr/geocodage/search", {
          params: {
            q: properties.id,
            index: "parcel",
            limit: 1,
            returntruegeometry: true,
          },
        })
      ).data;
    } catch (error) {
      console.error("Failed to fetch geometry for ref", properties, error);
      return;
    }

    const newFeature = {
      type: "Feature",
      geometry: featureCollection.features?.at(0)?.properties?.truegeometry,
      properties: {
        prefixe: cadastreFeature.getProperties().prefixe,
        numero: cadastreFeature.getProperties().numero,
        section: cadastreFeature.getProperties().section,
      },
    };

    const previewFeature = new GeoJSON().readFeature(newFeature) as Feature;

    previewFeature.setId(properties.id);
    previewSource.addFeature(previewFeature);
    selectedIds.value.push(properties.id);
    if (selectedIds.value.length > 0) {
      showCadastreModal.value = true;
    } else {
      showCadastreModal.value = false;
    }
  }
};

const zoomCommune = (e) => {
  if (!props.map || !e) return;

  const format = new GeoJSON();
  const feature = format.readFeature(e, {});

  if (!feature) return;

  const geometry = feature.getGeometry();
  if (!geometry) return;

  props.map.getView().fit(geometry.getExtent(), {
    size: props.map.getSize(),
    padding: [50, 50, 50, 50],
    maxZoom: 18,
    duration: 500,
  });
};

const addParcelleCadastraleModal = (e) => {
  if (!e) return;

  const format = new GeoJSON();
  const previewFeature = format.readFeature(e) as Feature;

  if (!previewFeature) return;
  const properties = e.properties || {};
  const parcelleId =
    properties.id ||
    `${properties.prefixe === "000" ? "" : properties.prefixe}${properties.section}${properties.numero}`;

  if (selectedIds.value.includes(parcelleId)) {
    const feature = previewSource.getFeatureById(parcelleId);
    if (feature) {
      previewSource.removeFeature(feature);
    }
    selectedIds.value = selectedIds.value.filter((s) => s !== parcelleId);
  } else {
    previewFeature.setId(parcelleId);
    previewSource.addFeature(previewFeature);
    selectedIds.value.push(parcelleId);
  }

  showCadastreModal.value = selectedIds.value.length > 0;
};

const handleClickRPG = async (e: MapBrowserEvent) => {
  const map = e.map;

  const features = map.getFeaturesAtPixel(e.pixel, {
    layerFilter: (layer) => layer.get("name") === "plan-rpg-layer",
  });

  if (!features || features.length === 0) {
    return;
  }

  const rpgFeature = features[0];
  if (rpgFeature) {
    const flatGeometry = rpgFeature.getGeometry();
    if (!flatGeometry) {
      return;
    }

    const featureId = rpgFeature.getId() || rpgFeature.getProperties().fid;

    if (selectedIds.value.includes(featureId)) {
      const feature = previewSource.getFeatureById(featureId);
      if (feature) {
        previewSource.removeFeature(feature);
      }
      selectedIds.value = selectedIds.value.filter((s) => s != featureId);
    } else {
      const geoJsonFormat = new GeoJSON();

      const geoJsonFeature = geoJsonFormat.writeFeatureObject(rpgFeature, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const newFeature = geoJsonFormat.readFeature(geoJsonFeature, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }) as Feature;

      newFeature.setId(featureId);
      newFeature.setStyle(previewStyle);

      previewSource.addFeature(newFeature);
      selectedIds.value.push(featureId);
    }

    showRPGModal.value = selectedIds.value.length > 0;
  }
};

const drawInteraction = (): void => {
  const { styleDrawing, stylePointDrawing, snapStyle } = createStyles();

  let currentDrawing: Feature | null = null;
  const snapFeatureRef = { current: null as Feature | null };

  draw = new Draw({
    type: "Polygon",
    style: [styleDrawing, stylePointDrawing],

    condition: (e: MapBrowserEvent) => {
      const coordPoint = e.coordinate;
      let canDraw = true;

      props.vectorSource.getFeatures().forEach((feature: Feature) => {
        if (feature.getGeometry()?.intersectsCoordinate(coordPoint)) {
          canDraw = false;
        }
      });

      return canDraw;
    },
    trace: true,
    traceSource: props.vectorLayer.getSource(),
    freehandCondition: () => false,
  });

  props.map.addInteraction(draw);

  const tooltip = new Tooltip({
    className: "draw-tooltip",
    closeBox: false,
    positioning: "bottom-left",
    offset: [10, -10],
    getHTML: createTooltipContent,
  });

  draw.on("drawstart", (e: DrawEvent) => {
    tooltip.setFeature(e.feature);
    props.map.addOverlay(tooltip);
    currentDrawing = e.feature;
  });

  draw.on("drawend", (e: DrawEvent) => {
    const newFeature = e.feature;

    if (snapFeatureRef.current) {
      props.vectorSource.removeFeature(snapFeatureRef.current);
      snapFeatureRef.current = null;
    }

    currentDrawing = null;

    props.map.removeOverlay(tooltip);
    const geojsonFormat = new GeoJSON();
    const geojsonFeature = geojsonFormat.writeFeatureObject(newFeature);

    try {
      const kinksResult = kinks(geojsonFeature);

      if (kinksResult.features.length > 0) {
        errorDrawing.value = true;
        invalidDrawing.value = false;

        const previewFeature = geojsonFormat.readFeature(geojsonFeature) as Feature;
        previewFeature.setStyle(errorStyle);
        previewSource.addFeature(previewFeature);

        feature.value = null;
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la géométrie:", error);
      errorDrawing.value = true;

      const previewFeature = geojsonFormat.readFeature(geojsonFeature) as Feature;
      previewFeature.setStyle(errorStyle);
      previewSource.addFeature(previewFeature);

      feature.value = null;
      return;
    }

    geojsonFeature.properties = {};
    feature.value = geojsonFeature;
    feature.value.id = 1;
    feature.value.properties.isCertified = recordStore.record.certification_state === "CERTIFIED";

    feature.value.properties.cultures = [{ CPF: "", id: crypto.randomUUID() }];
  });

  props.map.on("pointermove", (e: MapBrowserEvent) => {
    handleTracing(e, currentDrawing, snapStyle, snapFeatureRef);
  });
};

const cadastreInteraction = () => {
  sourceLayer =
    (props.map
      .getLayers()
      .getArray()
      .find((l) => l.get("name") === "plan-cadastre-layer") as VectorTileLayer) ?? null;

  if (!sourceLayer) {
    return;
  }

  props.map.on("click", handleClickCadastre);
};

const rpgInteraction = () => {
  sourceLayer =
    (props.map
      .getLayers()
      .getArray()
      .find((l) => l.get("name") === "plan-rpg-layer") as VectorTileLayer) ?? null;

  props.map.on("click", handleClickRPG);
};

const goToEdit = () => {
  loading.value = false;
  mapParams.value.currentMode = "edit";
};

const submitFeature = async (res: { id: string; properties: object }) => {
  feature.value.properties = { ...res.properties };
  loading.value = true;

  const result = await submitNewParcelle(props.recordId, feature.value);

  if (result) {
    const newFeatures = result.parcelles.features.filter(
      (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
    );
    const format = new GeoJSON();

    store.setAll(result.parcelles.features);

    for (const newFeature of newFeatures) {
      props.vectorLayer.getSource()?.addFeature(format.readFeature(newFeature) as Feature);
    }

    store.select(...newFeatures.map((f) => f.id as string));
  }

  if (result) {
    store.setAll(result.parcelles.features);
  }

  goToEdit();
};
const addCadastreFeatures = async () => {
  const format = new GeoJSON();
  loading.value = true;

  for (const f of previewSource.getFeatures()) {
    const featureObj = format.writeFeatureObject(f);
    featureObj.properties = {
      NOM: `Parcelle ${f.getProperties().prefixe === "000" ? "" : f.getProperties().prefixe}${f.getProperties().section}${f.getProperties().numero}`,
      cultures: [{ CPF: "", id: crypto.randomUUID() }],
    };

    const result = await submitNewParcelle(props.recordId, featureObj);

    if (result) {
      const newFeatures = result.parcelles.features.filter(
        (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
      );

      const format = new GeoJSON();
      store.setAll(result.parcelles.features);

      for (const newFeature of newFeatures) {
        props.vectorLayer.getSource()?.addFeature(format.readFeature(newFeature) as Feature);
      }

      store.select(newFeatures.map((f) => f.id as string));
    }
  }

  showCadastreModal.value = false;
  selectedIds.value = [];
  previewSource.clear();
  loading.value = false;
  goToEdit();
};

const addRpgFeatures = async () => {
  const format = new GeoJSON();
  loading.value = true;

  for (const f of previewSource.getFeatures()) {
    const featureObj = format.writeFeatureObject(f);
    featureObj.id = crypto.randomUUID();
    featureObj.properties = {
      NOM: `Parcelle RPG`,
      cultures: [{ CPF: "", id: crypto.randomUUID() }],
    };

    if (featureObj.geometry.type === "MultiPolygon") {
      featureObj.geometry.coordinates = featureObj.geometry.coordinates[0];
      featureObj.geometry.type = "Polygon";
    }

    const result = await submitNewParcelle(props.recordId, featureObj);

    if (result) {
      const newFeatures = result.parcelles.features.filter(
        (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
      );

      const format = new GeoJSON();
      store.setAll(result.parcelles.features);

      for (const newFeature of newFeatures) {
        props.vectorLayer.getSource()?.addFeature(format.readFeature(newFeature) as Feature);
      }

      store.select(newFeatures.map((f) => f.id as string));
    }
  }

  showRPGModal.value = false;
  selectedIds.value = [];
  previewSource.clear();
  loading.value = false;
  goToEdit();
};

const quitDraw = () => {
  cancelDraw();
  mapParams.value.currentMode = "consult";
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

/*
 * * Watchers
 */

watch(
  () => mode.value,
  () => {
    if (rpg === null && cadastre === null) {
      rpg = mapLayers.value.rpg;
      cadastre = mapLayers.value.cadastre;
    }
    store.unselectAll();
    selectedIds.value = [];
    previewSource.clear();

    if (draw) {
      props.map.removeInteraction(draw);
    }
    props.map.un("click", handleClickCadastre);
    props.map.un("click", handleClickRPG);
    invalidDrawing.value = false;
    errorDrawing.value = false;

    switch (mode.value) {
      case "dessiner":
        drawInteraction();
        mapLayers.value.cadastre = false;
        mapLayers.value.rpg = false;
        mapParams.value.blockPlan = false;
        break;
      case "cadastre":
        mapLayers.value.cadastre = true;
        mapLayers.value.rpg = false;
        mapParams.value.blockPlan = true;
        nextTick(() => {
          cadastreInteraction();
        });
        break;
      case "RPG":
        mapLayers.value.cadastre = false;
        mapLayers.value.rpg = true;
        mapParams.value.blockPlan = true;
        nextTick(() => {
          rpgInteraction();
        });
        break;
    }
  },
  { immediate: true },
);

watch(
  () => feature.value,
  async (newFeature) => {
    if (!newFeature) return;
    const format = new GeoJSON();
    invalidDrawing.value = false;
    errorDrawing.value = false;
    const data = (await addParcelleVerif(newFeature, props.recordId)).data;
    if (data.valid === true) {
      errorDrawing.value = false;
      const previewFeature = format.readFeature(newFeature) as Feature;
      previewFeature.setStyle(previewStyle);
      previewSource.addFeature(previewFeature);
      showDetailsModal.value = true;

      return;
    }

    errorDrawing.value = true;
    if (data.corrections && data.corrections.length > 0) {
      let feature = null; // = format.readFeature(newFeature) as Feature;

      if (data.corrections.length === 1) {
        feature = format.readFeature(data.corrections[0].new_minus_intersection) as Feature;
      } else {
        let correctedGeometry = data.corrections[0].new_minus_intersection;

        for (let i = 1; i < data.corrections.length; i++) {
          correctedGeometry = intersect(correctedGeometry, data.corrections[i].new_minus_intersection);
        }
        feature = format.readFeature(correctedGeometry) as Feature;
      }
      if (!feature) {
        return;
      }
      if (feature.getGeometry() && feature.getGeometry()?.getType() != "MultiPolygon") {
        invalidDrawing.value = true;
        const correctedRes = format.writeFeatureObject(feature);
        correctedRes.properties = {};

        correctedFeature.value = correctedRes;
        const extent = feature.getGeometry()?.getExtent();
        if (extent && !isNaN(extent[0])) {
          props.map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 18 });
        }

        previewSource.addFeature(feature as Feature);
        return;
      }
      const previewFeature = format.readFeature(newFeature) as Feature;
      previewFeature.setStyle(errorStyle);
      previewSource.addFeature(previewFeature);
      return;
    }

    const previewFeature = format.readFeature(newFeature) as Feature;
    previewFeature.setStyle(errorStyle);
    previewSource.addFeature(previewFeature);
  },
);

/**
 * * States fonctions
 */

onMounted(() => {
  props.map.addLayer(previewLayer);
  if (mapLayers.value.rpg === false && mapLayers.value.cadastre === true) {
    mode.value = "cadastre";
  } else if (mapLayers.value.rpg === true && mapLayers.value.cadastre === false) {
    mode.value = "RPG";
  } else if (mapLayers.value.rpg === true && mapLayers.value.cadastre === true) {
    mode.value = "cadastre";
  } else {
    mode.value = "dessiner";
  }
});

onUnmounted(() => {
  store.unselectAll();
  mapParams.value.blockPlan = false;
  props.map.removeLayer(previewLayer);
  props.map.un("click", handleClickCadastre);
  props.map.un("click", handleClickRPG);
  if (cadastre !== null && rpg !== null) {
    mapLayers.value.cadastre = cadastre;
    mapLayers.value.rpg = rpg;
  }
});
</script>

<style scoped>
.pop-in-top {
  align-items: center;
}

.title {
  align-content: center;
}

.pop-in-info {
  position: absolute;
  top: 115px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
}

.pop-in-info-cadastre {
  position: absolute;
  top: 115px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 10px;
  width: fit-content;
  align-items: center;
}

.vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 0.5em;
  background-color: grey;
  opacity: 0.25;
}
</style>
<style>
.pop-in-info-cadastre .aa-Autocomplete {
  margin-top: 0;
}
</style>
