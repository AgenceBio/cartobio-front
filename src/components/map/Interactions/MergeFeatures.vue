<template>
  <div class="pop-in-top">
    <p v-if="mergeFeature">Surface de la parcelle fusionné {{ calculateArea(mergeFeature) }} ha</p>
    <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmer">
      Valider et compléter
    </button>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="annuler"></button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import { Map } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { createFeaturesFromOther } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Geometry } from "ol/geom";
import { featureCollection, FeatureCollection } from "@turf/helpers";
import union from "@turf/union";
import { Fill, Stroke, Style } from "ol/style";

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

const preferences = usePreferences();
const store = useFeaturesStore();

const { map: mapPrefs } = storeToRefs(preferences);

const mergeFeature = ref<CartoBioFeature | null>(null);
let fusionLayer: VectorLayer | null = null;

/*
 * * Fonctions :  interactions
 */

const mergeFeatures = (): void => {
  const geojsonFormat = new GeoJSON();

  const resultMerge = mergeInteractions();
  if (resultMerge) {
    mergeFeature.value = geojsonFormat.writeFeatureObject(resultMerge) as CartoBioFeature;
  } else {
    console.warn("Afficher message d'erreur");
    mapPrefs.value.currentMode = "edit";
  }
};

const mergeInteractions = (): Feature<Geometry> | null => {
  if (store.selectedModifIds.length < 2) {
    console.error("Veuillez sélectionner au moins deux parcelles à fusionner.");
    return null;
  }

  const features = props.vectorSource.getFeatures().filter((f) => store.selectedModifIds.includes(String(f.getId())));

  if (features.length < 2) {
    console.error("Parcelles non trouvées dans la source.");
    return null;
  }

  const geojsonFormat = new GeoJSON();

  const turfFeatures = features.map((f) => geojsonFormat.writeFeatureObject(f));

  const fc: FeatureCollection = featureCollection(turfFeatures);

  let merged = fc.features[0];
  for (let i = 1; i < fc.features.length; i++) {
    merged = union(merged, fc.features[i]);
  }

  if (!merged || merged.geometry.type === "MultiPolygon") {
    // todo : Toast pour l'erreur
    console.error("Les parcelles ne se touchent pas. Impossible de faire l’union.");
    return null;
  }

  const olFeature: Feature<Geometry> = geojsonFormat.readFeature(merged) as Feature<Geometry>;
  const firstFeatureSelected = props.vectorSource.getFeatureById(store.selectedModifIds[0]);

  if (!firstFeatureSelected) {
    return null;
  }

  olFeature.setProperties({ ...firstFeatureSelected.getProperties(), geometry: olFeature.getGeometry() });
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

  olFeature.setStyle(previewStyle);

  const fusionSource = new VectorSource({
    features: [olFeature],
  });

  fusionLayer = new VectorLayer({
    source: fusionSource,
    zIndex: 1000,
  });

  props.map.addLayer(fusionLayer);

  return olFeature;
};

/*
 * * Fonctions : Data
 */

const confirmer = async (): Promise<void> => {
  if (mergeFeature.value) {
    const result = await createFeaturesFromOther(props.recordId, [mergeFeature.value], store.selectedModifIds);

    if (result) {
      const selectdIds = store.selectedModifIds;
      const geoJson = new GeoJSON();

      store.setSelectedModifiedFeature([]);
      const newFeatures = result.parcelles.features.filter(
        (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
      );
      store.setAll(result.parcelles.features);

      for (const selectdId of selectdIds) {
        const feature = props.vectorLayer.getSource()?.getFeatureById(selectdId);

        if (feature) {
          props.vectorLayer.getSource()?.removeFeature(feature);
        }
      }

      for (const newFeature of newFeatures) {
        props.vectorLayer.getSource()?.addFeature(geoJson.readFeature(newFeature) as Feature);
      }
    }
    mapPrefs.value.currentMode = "edit";
  }
};

const annuler = (): void => {
  store.setSelectedModifiedFeature([]);
  mapPrefs.value.currentMode = "edit";
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

/**
 * * States fonctions
 */

onMounted(() => {
  mergeFeatures();
});

onUnmounted(() => {
  if (fusionLayer) {
    props.map.removeLayer(fusionLayer);
  }
});
</script>
