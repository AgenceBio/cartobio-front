import Map from "ol/Map";
import Collection from "ol/Collection";
import Feature from "ol/Feature";
import { MultiPoint, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { click, platformModifierKeyOnly } from "ol/events/condition";
import Select from "ol/interaction/Select";
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import RegularShape from "ol/style/RegularShape";

export function modifyInteraction(map: Map, vectorLayer: VectorLayer<VectorSource>, featureStore: any): void {
  const selectedFeatures = new Collection<Feature<any>>();
  const styleDrawing = getPolygonStyle();
  const stylePointDrawing = getPointStyle();
  const select = createSelectInteraction(vectorLayer, selectedFeatures, featureStore);
  const modify = new ModifyFeature({
    features: selectedFeatures,
    style: [styleDrawing, stylePointDrawing],
  });
  select.on("select", (e) => {
    const selectedIds = e.target
      .getFeatures()
      .getArray()
      .map((feature: Feature) => feature.getId())
      .filter((id): id is string | number => id !== undefined);

    featureStore.setSelectedModifiedFeature(selectedIds);

    const source = vectorLayer.getSource();
    const alreadySelectedIds = featureStore.selectedModifIds ?? [];

    const featuresToRemove = [];
    selectedFeatures.forEach((feature) => {
      const featureId = feature.getId();
      if (!selectedIds.includes(featureId)) {
        featuresToRemove.push(feature);
      }
    });

    featuresToRemove.forEach((feature) => {
      selectedFeatures.remove(feature);
    });

    alreadySelectedIds.forEach((id) => {
      const feature = source?.getFeatureById(id);

      if (feature) {
        selectedFeatures.push(feature);

        if (alreadySelectedIds.length >= 2) {
          feature.setStyle(null);
          feature.setStyle([getPolygonMultipleStyle()]);
        } else {
          feature.setStyle(null);
          feature.setStyle([getPolygonStyle(), getPointStyle()]);
        }
      }
    });

    if (selectedIds.length >= 2) {
      modify.setActive(false);
    } else {
      modify.setActive(true);
    }

    e.deselected.forEach((feature) => {
      feature.setStyle(null);
    });
  });

  modify.on("modifyend", (e) => {
    // todo : faire la vérification de chevauchement + si valide envoie serveur
    console.log(e);
  });

  map.addInteraction(modify);
  map.addInteraction(select);
}

function getPolygonStyle(): Style {
  return new Style({
    fill: new Fill({ color: "rgba(74, 140, 190, 0.3)" }),
    stroke: new Stroke({ width: 3, color: "rgba(139, 248, 231, 1)" }),
  });
}

function getPolygonMultipleStyle(): Style {
  return new Style({
    fill: new Fill({ color: "rgba(74, 140, 190, 0.7)" }),
    stroke: new Stroke({ width: 3, color: "rgba(139, 248, 231, 1)" }),
  });
}

function getPointStyle(): Style {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    geometry: (feature: Feature) => {
      const coords = (feature.getGeometry() as Polygon)?.getCoordinates()[0];
      if (coords?.length) {
        return new MultiPoint(coords);
      }
    },
  });
}
function createSelectInteraction(
  layer: VectorLayer<VectorSource>,
  selectedFeatures: Collection<Feature>,
  featureStore: any,
): Select {
  const source = layer.getSource();
  const alreadySelectedIds = featureStore.selectedModifIds ?? [];

  alreadySelectedIds.forEach((id) => {
    const feature = source?.getFeatureById(id);
    if (feature && !selectedFeatures.getArray().includes(feature)) {
      selectedFeatures.push(feature);

      if (alreadySelectedIds.length >= 2) {
        feature.setStyle([getPolygonMultipleStyle()]);
      } else {
        feature.setStyle([getPolygonStyle(), getPointStyle()]);
      }
    }
  });

  const selectInteraction = new Select({
    layers: [layer],
    condition: click,
    toggleCondition: platformModifierKeyOnly,
    addCondition: platformModifierKeyOnly,
    removeCondition: platformModifierKeyOnly,
    multi: true,
  });

  selectInteraction.on("select", (e) => {
    e.deselected.forEach((feature) => {
      feature.setStyle(null);
    });
  });

  return selectInteraction;
}
