import Map from "ol/Map";
import Collection from "ol/Collection";
import Feature from "ol/Feature";
import { MultiPoint, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { click } from "ol/events/condition";
import Select from "ol/interaction/Select";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import RegularShape from "ol/style/RegularShape";
import { Modify } from "ol/interaction";
import Tooltip from "ol-ext/overlay/Tooltip";
import { legalProjectionSurface, inHa } from "@/utils/features.js";
import { GeoJSON } from "ol/format";
import { MapBrowserEvent } from "ol";
import { CartoBioFeature } from "@agencebio/cartobio-types";

let isModifying = false;
let select = null;

function modifyInteraction(map: Map, vectorLayer: VectorLayer<VectorSource>, featureStore: any): void {
  const selectedFeatures = new Collection<Feature>();
  select = createSelectInteraction(vectorLayer, selectedFeatures, featureStore);

  let modify: Modify | null = null;

  select.on("select", (e) => {
    if (isModifying) return;
    e.deselected.forEach((feature) => {
      feature.setStyle();
    });

    const selectedIds = e.target
      .getFeatures()
      .getArray()
      .map((feature: Feature) => feature.getId())
      .filter((id: string | number | undefined): id is string | number => id !== undefined);

    featureStore.setSelectedModifiedFeature(selectedIds);

    const source = vectorLayer.getSource();
    const alreadySelectedIds = featureStore.selectedModifIds ?? [];

    const featuresToRemove: Feature[] = [];
    selectedFeatures.forEach((feature) => {
      const featureId = feature.getId();
      if (!selectedIds.includes(featureId)) {
        featuresToRemove.push(feature);
      }
    });

    featuresToRemove.forEach((feature) => {
      selectedFeatures.remove(feature);
    });

    alreadySelectedIds.forEach((id: number) => {
      const feature = source?.getFeatureById(id);

      if (feature) {
        selectedFeatures.push(feature);

        if (alreadySelectedIds.length >= 2) {
          feature.setStyle([getPolygonMultipleStyle()]);
        } else {
          feature.setStyle([getPolygonStyle(), getPointStyle()]);
        }
      }
    });

    if (selectedIds.length === 1) {
      modify = new Modify({
        features: selectedFeatures,
        style: [
          getPolygonStyle(),
          new Style({
            image: new RegularShape({
              fill: new Fill({ color: "white" }),
              points: 4,
              radius: 7,
            }),
          }),
        ],
      });
      map.addInteraction(modify);
      const tooltip = new Tooltip({
        className: "draw-tooltip",
        closeBox: false,
        positioning: "bottom-left",
        offset: [10, -10],
        getHTML: createTooltipContent,
      });
      tooltip.setFeature(selectedFeatures.getArray()[0]);

      modify.on("modifystart", () => {
        isModifying = true;
        map.addOverlay(tooltip);
      });

      modify.on("modifyend", () => {
        map.removeOverlay(tooltip);
      });
    } else {
      if (modify) {
        map.removeInteraction(modify);
        modify = null;
      }
    }

    e.deselected.forEach((feature) => {
      feature.setStyle();
    });
  });

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

  alreadySelectedIds.forEach((id: number) => {
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
    condition: (e) => !isModifying && click(e),
    // toggleCondition: (e) => {
    //   console.log("togggle", isModifying, platformModifierKeyOnly(e));
    //   return isModifying && platformModifierKeyOnly(e);
    // },
    // addCondition: (e) => {
    //   console.log("addCondition", isModifying, platformModifierKeyOnly(e));
    //   return isModifying && platformModifierKeyOnly(e);
    // },
    // removeCondition: (e) => {
    //   console.log("removeCondition", isModifying, platformModifierKeyOnly(e));
    //   return isModifying && platformModifierKeyOnly(e);
    // },
    multi: true,
  });

  return selectInteraction;
}

function setIsModifying(val: boolean) {
  isModifying = val;
}

function createTooltipContent(feature: Feature) {
  const area = calculateArea(new GeoJSON().writeFeatureObject(feature, {}) as CartoBioFeature);
  return `
<div style="
  background: white;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: 'Marianne', sans-serif;
  white-space: nowrap;
">
 ${area ? `<div style="font-weight: bold;display: flex; align-items: center; gap: 8px;"> <i class="ri-custom-size"></i>${area} ha</div>` : ""}
</div>
`;
}

function calculateArea(feature: CartoBioFeature): string {
  return inHa(legalProjectionSurface(feature));
}

export { modifyInteraction, setIsModifying };
