import { featureCollection } from "@turf/helpers";
import { Draw } from "ol/interaction";
import { Style, Fill, Stroke, RegularShape } from "ol/style";
import { Feature } from "ol";
import { LineString, MultiPoint } from "ol/geom";
import { GeoJSON } from "ol/format";
import Tooltip from "ol-ext/overlay/Tooltip";
import type { Map as OlMap } from "ol";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { Ref } from "vue";
import Snap from "ol/interaction/Snap";
import { MapBrowserEvent } from "ol";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

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
    geometry: (e: Feature<any>) => {
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

const createTooltipContent = (area?: string) => `
  <div style="
    background: white;
    padding: 8px 12px;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    font-family: 'Marianne', sans-serif;
    white-space: nowrap;
  ">
    <div style="font-weight: bold; margin-bottom: 4px;">Nouvelle parcelle</div>
    <div style="display: flex; align-items: center; gap: 8px;">
    <span class="fr-icon--sm fr-icon-map-pin-2-line" aria-hidden="true"></span>
    Double clic pour finaliser le tracé
    </div>
   ${area ? `<div style="font-weight: bold;display: flex; align-items: center; gap: 8px;"> <i class="ri-custom-size"></i>${area} ha</div>` : ""}
  </div>
`;

const handleTracing = (
  e: any,
  currentDrawing: Feature | null,
  map: OlMap,
  vectorLayer: VectorLayer<any>,
  vectorSource: VectorSource<any>,
  snapStyle: Style,
  snapFeatureRef: { current: Feature | null },
) => {
  if (!currentDrawing) return;

  const coordinate = e.coordinate;
  const pixel = map.getPixelFromCoordinate(coordinate);

  const features = map.getFeaturesAtPixel(pixel, {
    layerFilter: (layer) => layer === vectorLayer,
    hitTolerance: 10,
  });

  if (snapFeatureRef.current) {
    vectorSource.removeFeature(snapFeatureRef.current);
    snapFeatureRef.current = null;
  }

  if (features.length > 0 && features[0] !== currentDrawing) {
    const targetFeature = features[0];
    const targetGeom = targetFeature.getGeometry();

    if (targetGeom) {
      snapFeatureRef.current = new Feature({ geometry: targetGeom.clone() });
      snapFeatureRef.current.setStyle(snapStyle);
      vectorSource.addFeature(snapFeatureRef.current);
    }
  }
};

const updateTooltipPosition = (
  e: any,
  tooltipElement: HTMLElement | null,
  currentDrawing: Feature | null,
  map: OlMap,
) => {
  if (tooltipElement && currentDrawing) {
    const pixel = map.getPixelFromCoordinate(e.coordinate);
    tooltipElement.style.left = `${pixel[0] + 10}px`;
    tooltipElement.style.top = `${pixel[1] - 10}px`;
  }
};

export const drawInteraction = (
  map: OlMap,
  vectorLayer: VectorLayer<any>,
  vectorSource: VectorSource<any>,
  updateFeatureStoreCollection: () => void,
  showDetailsModal: Ref<boolean>,
  featureRef: Ref<Feature | null>,
): void => {
  const { styleDrawing, stylePointDrawing, snapStyle } = createStyles();

  let currentDrawing: Feature | null = null;
  const snapFeatureRef = { current: null as Feature | null };

  const snapInteraction = new Snap({
    source: vectorLayer.getSource(),
  });

  const drawPoly = new Draw({
    type: "Polygon",
    style: [styleDrawing, stylePointDrawing],

    condition: (e: MapBrowserEvent) => {
      const coordPoint = e.coordinate;
      let canDraw = true;

      vectorSource.getFeatures().forEach((feature) => {
        if (feature.getGeometry().intersectsCoordinate(coordPoint)) {
          canDraw = false;
        }
      });

      return canDraw;
    },
    trace: true,
    traceSource: vectorLayer.getSource(),
    freehandCondition: () => false,
  });

  map.addInteraction(drawPoly);
  map.addInteraction(snapInteraction);

  const tooltip = new Tooltip({
    className: "draw-tooltip",
    closeBox: false,
    positioning: "bottom-left",
    offset: [10, -10],
  });

  let tooltipElement: HTMLElement | null = null;

  map.addOverlay(tooltip);

  drawPoly.on("drawstart", (e: MapBrowserEvent) => {
    currentDrawing = e.feature;

    tooltipElement = document.createElement("div");
    tooltipElement.innerHTML = createTooltipContent();
    tooltipElement.style.position = "absolute";
    tooltipElement.style.pointerEvents = "none";
    tooltipElement.style.zIndex = "1000";

    const mapContainer = map.getTargetElement();
    if (mapContainer) mapContainer.appendChild(tooltipElement);

    const geometry = currentDrawing.getGeometry();
    geometry.on("change", () => {
      const area = calculateArea(new GeoJSON().writeFeatureObject(currentDrawing, {}));
      if (tooltipElement) tooltipElement.innerHTML = createTooltipContent(area);
    });
  });

  drawPoly.on("drawend", (e: MapBrowserEvent) => {
    const feature = e.feature;

    if (snapFeatureRef.current) {
      vectorSource.removeFeature(snapFeatureRef.current);
      snapFeatureRef.current = null;
    }

    currentDrawing = null;

    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }

    map.removeOverlay(tooltip);
    const geojsonFormat = new GeoJSON();
    const geojsonFeature = geojsonFormat.writeFeatureObject(feature);
    geojsonFeature.properties = {};
    featureRef.value = geojsonFeature;
  });

  map.on("pointermove", (e: MapBrowserEvent) => {
    handleTracing(e, currentDrawing, map, vectorLayer, vectorSource, snapStyle, snapFeatureRef);
    updateTooltipPosition(e, tooltipElement, currentDrawing, map);
  });
};

/*
 * * Utils fonctions
 */

const calculateArea = (feature: any): string => {
  return inHa(legalProjectionSurface(feature));
};
