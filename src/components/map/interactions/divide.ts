import { RegularShape } from "ol/style";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import { LineString, Point, Polygon, MultiPolygon, MultiPoint, MultiLineString, LinearRing } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import * as jsts from "jsts/dist/jsts.min";
import { click } from "ol/events/condition";

import { legalProjectionSurface, inHa } from "@/utils/features.js";
import { Interaction } from "ol/interaction";
import { Ref } from "vue";
import { MapBrowserEvent } from "ol/MapBrowserEvent";
import { DrawEvent } from "ol/DrawEvent";

let modifyInteraction: Modify | null = null;
let selectInteraction: Select | null = null;
let currentOverlays: Overlay[] = [];
let previewLayer: VectorLayer<VectorSource> | null = null;
let drawingLineSource: VectorSource | null = null;
let drawingLineLayer: VectorLayer<VectorSource> | null = null;
let clickCount = 0;
let resSource: VectorSource;
let hasDivision: Ref<boolean>;
let map: Map;

function divideInteraction(
  _map: Map,
  vectorLayer: VectorLayer<VectorSource>,
  targetFeature: Feature,
  _resultLayer: VectorSource,
  _hasDivision: Ref<boolean>,
): void {
  map = _map;
  resSource = _resultLayer;
  hasDivision = _hasDivision;
  const lineStyle = new Style({
    stroke: new Stroke({ color: [0, 0, 255, 0.8], width: 3 }),
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    zIndex: 6,
  });

  const modifyStyle = new Style({
    stroke: new Stroke({ color: [0, 0, 255, 0.8], width: 3 }),
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    zIndex: 7,
  });

  const previewSource = new VectorSource({ projection: map.getView().getProjection() });
  previewLayer = new VectorLayer({
    source: previewSource,
    zIndex: 5,
  });

  drawingLineSource = new VectorSource({ projection: map.getView().getProjection() });
  drawingLineLayer = new VectorLayer({
    source: drawingLineSource,
    style: lineStyle,
    zIndex: 6,
  });

  const draw = new Draw({
    type: "LineString",
    source: drawingLineSource,
    freehand: false,
    style: [lineStyle],
  });

  clickCount = 0;

  map.addLayer(previewLayer);
  map.addLayer(drawingLineLayer);
  map.addInteraction(draw);

  modifyInteraction = new Modify({
    source: drawingLineSource,
    style: modifyStyle,
  });

  selectInteraction = new Select({
    condition: click,
    layers: [drawingLineLayer],
    style: modifyStyle,
  });

  const handleMapClick = (evt: MapBrowserEvent) => {
    if (!targetFeature) return;

    const coordinate = evt.coordinate;

    const isInsidePolygon = targetFeature.getGeometry()?.intersectsCoordinate(coordinate);

    if (!isInsidePolygon) {
      clickCount++;
      if (clickCount >= 2) {
        draw.finishDrawing();
      }
    }
  };

  map.on("click", handleMapClick);

  draw.on("drawstart", (e: DrawEvent) => {
    cleanupPreview(map, previewSource);

    e.feature.getGeometry()?.on("change", (evt: DrawEvent) => {
      updatePreview(evt.target, previewSource, targetFeature, map);
    });
  });

  draw.on("drawend", () => {
    map.un("click", handleMapClick);

    map.removeInteraction(draw);

    map.addInteraction(selectInteraction as Interaction);
    map.addInteraction(modifyInteraction as Interaction);

    modifyInteraction?.on("modifyend", () => {
      const lineFeature = drawingLineSource?.getFeatures()[0];
      if (lineFeature) {
        updatePreview(lineFeature.getGeometry(), previewSource, targetFeature, map);
      }
    });
  });

  draw.on("drawabort", () => {
    map.un("click", handleMapClick);
    cleanup();
  });
}

function updatePreview(lineGeom: LineString, previewSource: VectorSource, targetFeature: Feature, map: Map): void {
  previewSource.clear();
  currentOverlays.forEach((overlay) => {
    map.removeOverlay(overlay);
  });
  currentOverlays = [];

  const parser = new jsts.io.OL3Parser();
  parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);

  const lineJsts = parser.read(lineGeom);

  if (!targetFeature || !(targetFeature.getGeometry() instanceof Polygon)) {
    return;
  }

  const newPolygons: Feature<Polygon>[] = [];
  const polyJsts = parser.read(targetFeature.getGeometry());

  if (lineJsts.intersects(polyJsts)) {
    try {
      const union = polyJsts.getExteriorRing().union(lineJsts);
      const polygonizer = new jsts.operation.polygonize.Polygonizer();
      polygonizer.add(union);
      const polys = polygonizer.getPolygons();

      if (polys.array.length === 2) {
        const parcelle1Style = new Style({
          stroke: new Stroke({ color: [0, 123, 255, 0.8], width: 2 }),
          fill: new Fill({ color: [0, 123, 255, 0.3] }),
          zIndex: 4,
        });

        const parcelle2Style = new Style({
          stroke: new Stroke({ color: [40, 167, 69, 0.8], width: 2 }),
          fill: new Fill({ color: [40, 167, 69, 0.3] }),
          zIndex: 4,
        });

        resSource.clear();
        polys.array.forEach((geom, index) => {
          const newFeature = new Feature({
            ...targetFeature.getProperties(),
            geometry: new Polygon(parser.write(geom).getCoordinates()),
          });
          resSource.addFeature(newFeature);
          newFeature.setStyle(index === 0 ? parcelle1Style : parcelle2Style);
          newPolygons.push(newFeature);
        });
        hasDivision.value = true;
      }
    } catch (error) {
      console.warn("Erreur lors du découpage:", error);
    }
  }

  if (newPolygons.length === 2) {
    const numeroI = targetFeature.get("NUMERO_I") || "";
    const numeroP = targetFeature.get("NUMERO_P") || "";
    const nom = targetFeature.get("NOM") || "";

    let text = "";
    if (numeroI.toString() !== "") {
      text = `Ilôt ${numeroI} parcelle ${numeroP}\r`;
    } else if (nom) {
      text = nom;
    }

    const parcelle1Geometry = new GeoJSON().writeFeatureObject(newPolygons[0], {});
    const parcelle1Area = calculateArea(parcelle1Geometry);

    const parcelle2Geometry = new GeoJSON().writeFeatureObject(newPolygons[1], {});
    const parcelle2Area = calculateArea(parcelle2Geometry);

    const extent = targetFeature.getGeometry()?.getExtent();
    if (!extent) {
      return;
    }
    const [minX, , maxX, maxY] = extent;
    const centerX = (minX + maxX) / 2;
    const positionning = [centerX, maxY];

    const tooltipOverlay = createTooltipOverlay(map);
    const tooltipContent = `
      <div style="
        background: white;
        padding: 8px 12px;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: 'Marianne', sans-serif;
        white-space: nowrap;
        border-radius: 4px;
      ">
        <div style="font-weight: bold; margin-bottom: 4px;">Division de la parcelle : ${text}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="width: 12px; height: 12px; background-color: rgba(0, 123, 255, 0.6); border-radius: 2px;"></span>
           1: ${parcelle1Area} ha
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; background-color: rgba(40, 167, 69, 0.6); border-radius: 2px;"></span>
           2: ${parcelle2Area} ha
        </div>
      </div>
    `;

    tooltipOverlay.getElement().innerHTML = tooltipContent;
    tooltipOverlay.setPosition(positionning);
  }

  newPolygons.forEach((poly) => {
    previewSource.addFeature(poly);
  });
}

function createTooltipOverlay(map: Map): Overlay {
  const div = document.createElement("div");
  div.className = "ol-tooltip ol-tooltip-static";
  div.style.display = "block";

  const overlay = new Overlay({
    element: div,
    offset: [0, -15],
    positioning: "bottom-center",
  });

  map.addOverlay(overlay);
  currentOverlays.push(overlay);

  return overlay;
}

function cleanup(): void {
  clickCount = 0;
  hasDivision.value = false;
  resSource.clear();

  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }
  if (selectInteraction) {
    map.removeInteraction(selectInteraction);
    selectInteraction = null;
  }

  if (previewLayer) {
    cleanupPreview(map, previewLayer.getSource());
    map.removeLayer(previewLayer);
    previewLayer = null;
  }
  if (drawingLineLayer) {
    map.removeLayer(drawingLineLayer);
    drawingLineLayer = null;
  }

  if (drawingLineSource) {
    drawingLineSource.clear();
    drawingLineSource = null;
  }
}

/*
 * * Utils
 */

function updateOverlay(overlay: Overlay, pos: number[], value: number | string, unit: string, bold = false): void {
  overlay.setPosition(pos);
  const content = bold ? `<b>${value} ${unit}</b>` : `${value} ${unit}`;
  overlay.getElement().innerHTML = content;
}

export function cleanupPreview(map: Map, previewSource: VectorSource): void {
  currentOverlays.forEach((overlay) => {
    map.removeOverlay(overlay);
  });
  currentOverlays = [];

  previewSource.clear();
}

function calculateArea(feature: Feature): string {
  return inHa(legalProjectionSurface(feature));
}

export { cleanup, divideInteraction, updateOverlay };
