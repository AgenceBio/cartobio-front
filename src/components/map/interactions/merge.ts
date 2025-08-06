import { Feature, Geometry } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import { featureCollection, FeatureCollection } from "@turf/helpers";
import union from "@turf/union";
import VectorSource from "ol/source/Vector";
import type Map from "ol/Map";

import VectorLayer from "ol/layer/Vector";

let fusionLayer: VectorLayer<VectorSource<Geometry>> | null = null;

export function mergeInteractions(
  vectorSource: VectorSource<Geometry>,
  map: Map,
  selectedIds: string[],
): Feature<Geometry> | null {
  if (selectedIds.length < 2) {
    console.error("Veuillez sélectionner au moins deux parcelles à fusionner.");
    return null;
  }

  const features = vectorSource.getFeatures().filter((f) => selectedIds.includes(String(f.getId())));

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

  const olFeature: Feature<Geometry> = geojsonFormat.readFeature(merged);

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

  if (fusionLayer) {
    clearMergeLayer(map);
  }

  const fusionSource = new VectorSource<Geometry>({
    features: [olFeature],
  });

  fusionLayer = new VectorLayer({
    source: fusionSource,
    zIndex: 1000,
  });

  fusionLayer.set("name", "layer-merge");

  map.addLayer(fusionLayer);

  return olFeature;
}

export function clearMergeLayer(map: Map): void {
  const layerMerge = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get("name") == "layer-merge");
  if (layerMerge) {
    map.removeLayer(layerMerge);
    fusionLayer = null;
  }
}
