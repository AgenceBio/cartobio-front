<template>
  <div class="pop-in-top merge">
    <div class="title fr-mr-2v">
      <p v-if="mergeFeature" class="fr-sr-only" role="status" aria-live="polite">
        Une fusion de parcelles est en cours. Surface totale : {{ calculateArea(mergeFeature) }} hectares.
      </p>
      <p v-else-if="isErrorMerging" class="fr-sr-only" role="alert">Erreur : {{ errorMessage }}.</p>
      <i class="ri-merge-cells-horizontal" aria-hidden="true" />
      <strong class="fr-ml-1v">Fusionner</strong>
    </div>
    <div class="action" v-if="mergeFeature">
      <span class="area-info green fr-mr-2v"></span>
      <p class="fr-mb-0 title fr-mr-2v">Parcelle fusionnée {{ calculateArea(mergeFeature) }} ha</p>
      <button
        class="fr-btn fr-btn--sm fr-icon-check-line fr-btn--icon-right"
        aria-label="Confirmer la fusion des parcelles"
        @click="showDetailsModal = true"
      >
        Fusionner
      </button>
      <div class="fr-ml-2w vr" />
      <button
        class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline fr-btn--sm"
        aria-label="Annuler la fusion"
        @click="annuler"
      ></button>
    </div>
    <div v-if="isErrorMerging" class="flex">
      <p class="fr-text--sm fr-my-auto fr-mr-1w">{{ errorMessage }}</p>
      <div class="fr-ml-3w vr" />
      <button
        class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline fr-btn--sm"
        @click="annuler"
        aria-label="Fermer le message d’erreur"
      ></button>
    </div>
  </div>
  <Teleport to="body">
    <AddParcelleModal
      v-if="showDetailsModal && mergeFeature"
      :feature="mergeFeature"
      @close="goToEdit"
      @submit="confirmer"
      icon="fr-icon-add-line"
      :data-content-name="'Modale de fusion des parcelles'"
      required-name
    >
      <template #title>Nouvelle parcelle</template>
    </AddParcelleModal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, Ref } from "vue";
import { storeToRefs } from "pinia";

import { Map } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import AddParcelleModal from "@/components/forms/AddParcelleModal.vue";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { createFeaturesFromOther } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Geometry } from "ol/geom";
import { featureCollection, FeatureCollection, Feature as TurfFeature, Polygon, MultiPolygon } from "@turf/helpers";
import union from "@turf/union";
import { Fill, Stroke, Style } from "ol/style";
import { CartoBioCulture } from "@agencebio/cartobio-types/outputs/types/features";

/*
 * * Variables
 */

let fusionLayer: VectorLayer | null = null;

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

const { params: mapParams } = storeToRefs(preferences);

/*
 * * Refs
 */

const mergeFeature = ref<CartoBioFeature | null>(null);

const showDetailsModal = ref(false);

const isErrorMerging = ref<boolean>(false);
const errorMessage = ref<string>("");

const loading: Ref<boolean> = inject("loading", ref(false));

/*
 * * Fonctions :  interactions
 */

const mergeFeatures = (): void => {
  const geojsonFormat = new GeoJSON();

  const resultMerge = mergeInteractions();
  if (resultMerge) {
    const mergedFeature = geojsonFormat.writeFeatureObject(resultMerge) as CartoBioFeature;

    const features = props.vectorSource.getFeatures().filter((f) => store.selectedIds.includes(String(f.getId())));

    mergedFeature.properties = {};
    mergedFeature.id = 1;
    // needed to get validation on all form
    mergedFeature.properties.isCertified = true;
    mergedFeature.properties.cultures = getUniformProperty(features, "cultures") || [
      { CPF: "", id: crypto.randomUUID() },
    ];
    mergedFeature.properties.conversion_niveau = getUniformProperty(features, "conversion_niveau") || "";
    mergeFeature.value = mergedFeature;
  } else {
    console.warn("Afficher message d'erreur");
  }
};

const mergeInteractions = (): Feature<Geometry> | null => {
  if (store.selectedIds.length < 2) {
    console.error("Veuillez sélectionner au moins deux parcelles à fusionner.");
    return null;
  }

  const features = props.vectorSource.getFeatures().filter((f) => store.selectedIds.includes(String(f.getId())));

  if (features.length < 2) {
    console.error("Parcelles non trouvées dans la source.");
    return null;
  }

  const geojsonFormat = new GeoJSON();

  const turfFeatures = features.map((f) => geojsonFormat.writeFeatureObject(f));

  const fc = featureCollection(turfFeatures) as FeatureCollection<Polygon | MultiPolygon>;

  let merged: TurfFeature<Polygon | MultiPolygon> | null;
  try {
    merged = union(fc);
  } catch (e) {
    console.error("Échec de l'union des parcelles", e);
    isErrorMerging.value = true;
    errorMessage.value = "Impossible de fusionner ces parcelles.";
    return null;
  }

  if (!merged || merged.geometry.type === "MultiPolygon") {
    isErrorMerging.value = true;
    errorMessage.value = "Les parcelles ne se touchent pas. Impossible de les fusionner.";
    return null;
  }

  const olFeature: Feature<Geometry> = geojsonFormat.readFeature(merged) as Feature<Geometry>;
  const firstFeatureSelected = props.vectorSource.getFeatureById(store.selectedIds[0]);

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

const confirmer = async (e: {
  id: string;
  properties: {
    NOM: string;
    annotations: Array<object>;
    conversion_niveau: string;
    cultures: CartoBioCulture[];
    engagement_date: string;
    auditeur_notes: string;
  };
}): Promise<void> => {
  if (mergeFeature.value) {
    mergeFeature.value.properties = {
      ...mergeFeature.value.properties,
      NOM: e.properties.NOM,
      annotations: e.properties.annotations,
      auditeur_notes: e.properties.auditeur_notes,
      conversion_niveau: e.properties.conversion_niveau,
      cultures: e.properties.cultures,
      engagement_date: e.properties.engagement_date,
    };
    loading.value = true;
    try {
      const result = await createFeaturesFromOther(props.recordId, [mergeFeature.value], store.selectedIds);

      if (result) {
        const selectdIds = store.selectedIds;
        const geoJson = new GeoJSON();

        store.unselectAll();
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
      showDetailsModal.value = false;
      loading.value = false;
      mapParams.value.currentMode = "edit";
    } finally {
      loading.value = false;
    }
  }
};

const annuler = (): void => {
  mapParams.value.currentMode = "edit";
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

const goToEdit = () => {
  showDetailsModal.value = false;
  mapParams.value.currentMode = "edit";
};

const getUniformProperty = (features: Feature<Geometry>[], propName: string) => {
  const values = features.map((f) => f.get(propName));
  const firstValue = values[0];
  return values.every((v) => JSON.stringify(v) === JSON.stringify(firstValue)) ? firstValue : false;
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

<style scoped>
.pop-in-top.merge {
  gap: 10px;
  padding: 5px 10px;
  align-items: center;
  width: max-content;
  border-radius: 4px;
}

.title {
  align-content: center;
}

.action {
  text-align: center;
  display: flex;
}

.area-info.green {
  width: 15px;
  height: 15px;

  background: #174c5f;
  border: 2px dashed #60e0eb;
  display: inline-block;

  margin: auto 0px;
}

.vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 0.5em;
  background-color: grey;
  opacity: 0.25;
}

.flex {
  display: flex;
}
</style>
