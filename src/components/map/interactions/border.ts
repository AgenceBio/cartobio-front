import Map from "ol/Map";
import Overlay from "ol/Overlay";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import {
  LineString,
  Point,
  Polygon,
  MultiPolygon,
  MultiPoint,
  MultiLineString,
  LinearRing,
  GeometryCollection,
  Geometry,
} from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { legalProjectionSurface, inHa } from "@/utils/features.js";
import CircleStyle from "ol/style/Circle";
import { Coordinate } from "ol/coordinate";
import proj4 from "proj4";
import * as jsts from "jsts/dist/jsts.min";
import { Ref } from "vue";
import { Translate } from "ol/interaction";

let map: Map;
let dragStart: Translate | null = null;
let dragEnd: Translate | null = null;
let changeBorder: Translate | null = null;
let currentOverlays: Overlay[] = [];
let targetFeature: Feature | null = null;
let previewClosestPointSource: VectorSource | null = null;
let previewClosestPointLayer: VectorLayer<VectorSource> | null = null;
let previewStartPointSource: VectorSource | null = null;
let previewStartPointLayer: VectorLayer<VectorSource> | null = null;
let previewEndPointSource: VectorSource | null = null;
let previewEndPointLayer: VectorLayer<VectorSource> | null = null;
let previewBorderSource: VectorSource | null = null;
let previewResSource: VectorSource | null = null;
let previewBorderLayer: VectorLayer<VectorSource> | null = null;
let closestPoint: Coordinate | undefined | null;
let closestSegmentIndex = -1;
let startBorderPoint: Coordinate | undefined | null;
let endBorderPoint: Coordinate | undefined | null;
let startSegmentIndex = -1;
let endSegmentIndex = -1;
let isInverted = false;
let allBorder = false;
let distance: Ref<number>;
let hasBorder: Ref<boolean>;
let isDragging = false;

let handleMapClick: (e: any) => void;
let handlePointerMove: (e: any) => void;

function borderInteraction(
  _map: Map,
  _targetFeature: Feature,
  _hasBorder: Ref<boolean>,
  _distance: Ref<number>,
  _previewBorderSource: VectorSource,
): void {
  map = _map;
  hasBorder = _hasBorder;
  distance = _distance;
  previewResSource = _previewBorderSource;
  targetFeature = _targetFeature;
  if (!targetFeature) return;

  previewClosestPointSource = new VectorSource({ projection: map.getView().getProjection() });
  previewClosestPointLayer = new VectorLayer({
    source: previewClosestPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
    zIndex: 6,
  });

  previewStartPointSource = new VectorSource({ projection: map.getView().getProjection() });
  previewStartPointLayer = new VectorLayer({
    source: previewStartPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
    zIndex: 9,
  });

  previewEndPointSource = new VectorSource({ projection: map.getView().getProjection() });
  previewEndPointLayer = new VectorLayer({
    source: previewEndPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
    zIndex: 10,
  });

  previewBorderSource = new VectorSource({ projection: map.getView().getProjection() });
  previewBorderLayer = new VectorLayer({
    source: previewBorderSource,
    style: new Style({
      stroke: new Stroke({ color: [40, 167, 69, 0.8], width: 2 }),
      fill: new Fill({ color: [40, 167, 69, 0.3] }),
    }),
    zIndex: 8,
  });

  map.addLayer(previewClosestPointLayer);
  map.addLayer(previewStartPointLayer);
  map.addLayer(previewEndPointLayer);
  map.addLayer(previewBorderLayer);

  handlePointerMove = (event: any) => {
    movePoint(event);
  };

  map.on("pointermove", handlePointerMove);

  handleMapClick = () => {
    if (!closestPoint) return;

    if (!startBorderPoint) {
      startBorderPoint = closestPoint;
      startSegmentIndex = closestSegmentIndex;
    } else if (!endBorderPoint) {
      map.un("pointermove", handlePointerMove);
      map.un("click", handleMapClick);
      endBorderPoint = closestPoint;
      endSegmentIndex = closestSegmentIndex;
      closestPoint = null;
      if (previewStartPointLayer && !dragStart) {
        dragStart = dragPoint(previewStartPointLayer, (v: { point: Coordinate; segment: number }) => {
          startBorderPoint = v.point;
          startSegmentIndex = v.segment;
        });
      }
      if (previewEndPointLayer && !dragEnd) {
        dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
          endBorderPoint = v.point;
          endSegmentIndex = v.segment;
        });
      }

      drawPoints();
    }
  };

  map.on("click", handleMapClick);
}

function dragPoint(
  layer: VectorLayer<VectorSource>,
  setValue: (value: { point: Coordinate; segment: number }) => void,
) {
  const translate = new Translate({
    layers: [layer],
    hitTolerance: 10,
  });

  translate.on("translating", function (event) {
    isDragging = true;
    const coordinate = movePoint(event);
    if (coordinate) {
      setValue(coordinate);
    }
  });

  // Écouter l'événement modifyend
  translate.on("translateend", function () {
    isDragging = false;
  });

  map.addInteraction(translate);
  return translate;
}

function changeBorderSize() {
  if (!previewBorderLayer) return null;
  const translate = new Translate({
    layers: [previewBorderLayer],
  });

  translate.on("translating", function (event) {
    isDragging = true;

    const coordinate = proj4("EPSG:4326", "EPSG:3857", event.coordinate);
    const geometry = targetFeature?.getGeometry();
    const tmpClosestPoint = geometry?.getClosestPoint(event.coordinate);
    if (!tmpClosestPoint) return;
    const closestPoint = proj4("EPSG:4326", "EPSG:3857", tmpClosestPoint);
    const segment = new LineString([coordinate, closestPoint]);
    distance.value = +segment.getLength().toFixed(2);
    drawBorder();
  });

  // Écouter l'événement modifyend
  translate.on("translateend", function () {
    isDragging = false;
  });

  map.addInteraction(translate);
  return translate;
}
function drawPoints() {
  if (!previewClosestPointSource || !previewStartPointSource || !previewEndPointSource) return;
  previewClosestPointSource.clear();
  if (closestPoint && !isDragging) {
    const feature = new Feature({
      geometry: new Point(closestPoint),
    });

    previewClosestPointSource.addFeature(feature);
  }

  if (startBorderPoint) {
    const feature = new Feature({
      geometry: new Point(startBorderPoint),
    });

    previewStartPointSource?.clear();
    previewStartPointSource.addFeature(feature);
  }

  if (endBorderPoint) {
    const feature = new Feature({
      geometry: new Point(endBorderPoint),
    });

    previewEndPointSource.clear();
    previewEndPointSource.addFeature(feature);
  }

  if (startBorderPoint && endBorderPoint) {
    if (!isDragging && previewStartPointLayer && previewEndPointLayer) {
      dragStart = dragPoint(previewStartPointLayer, (v: { point: Coordinate; segment: number }) => {
        startBorderPoint = v.point;
        startSegmentIndex = v.segment;
      });
      dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
        endBorderPoint = v.point;
        endSegmentIndex = v.segment;
      });
    }
    drawBorder();
  }
}

function drawBorder() {
  if (!changeBorder) {
    changeBorder = changeBorderSize();
  }

  currentOverlays.forEach((overlay) => {
    map.removeOverlay(overlay);
  });
  currentOverlays = [];
  previewBorderSource?.clear();
  if (!targetFeature) return;
  const polygonIn3857 = targetFeature.getGeometry()?.clone();

  if (!polygonIn3857) return;

  polygonIn3857.setCoordinates(
    polygonIn3857.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:4326", "EPSG:3857", point));
    }),
  );

  const parser = new jsts.io.OL3Parser();
  parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

  const parcelleJsts = parser.read(polygonIn3857);
  const parcelleAggrandieJsts = parcelleJsts.buffer(0.01);

  const parcelleSansBordureJsts = parcelleAggrandieJsts.buffer(-(distance.value + 0.01));
  const allBordureJsts = parcelleAggrandieJsts.difference(parcelleSansBordureJsts);

  let bordureJsts;
  if (allBorder) {
    bordureJsts = allBordureJsts;
  } else {
    const parcelle = parser.write(parcelleSansBordureJsts);
    const splittingLine = getSplittingLine(distance.value * 1.1, polygonIn3857, parcelle);
    const lineJsts = parser.read(splittingLine);

    const union = allBordureJsts.getExteriorRing().union(lineJsts);
    const polygonizer = new jsts.operation.polygonize.Polygonizer();
    polygonizer.add(union);
    const polys = polygonizer.getPolygons();
    bordureJsts = polys.array
      .filter((poly) => poly.intersection(allBordureJsts).getArea() > 0)
      [+isInverted].intersection(allBordureJsts);
  }

  const bordure = parser.write(bordureJsts);
  bordure.setCoordinates(
    bordure.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:3857", "EPSG:4326", point));
    }),
  );

  const withoutBordure = parser.write(parcelleJsts.difference(bordureJsts));
  withoutBordure.setCoordinates(
    withoutBordure.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:3857", "EPSG:4326", point));
    }),
  );

  const res = new Feature({
    ...targetFeature.getProperties(),
    geometry: bordure,
  });

  const featureWithoutBordure = new Feature({
    ...targetFeature.getProperties(),
    geometry: withoutBordure,
  });

  const numeroI = targetFeature.get("NUMERO_I") || "";
  const numeroP = targetFeature.get("NUMERO_P") || "";
  const nom = targetFeature.get("NOM") || "";

  let text = "";
  if (numeroI.toString() !== "") {
    text = `Ilôt ${numeroI} parcelle ${numeroP}\r`;
  } else if (nom) {
    text = nom;
  }

  previewResSource?.clear();
  previewResSource?.addFeature(featureWithoutBordure);
  previewResSource?.addFeature(res);

  const parcelle1Geometry = new GeoJSON().writeFeatureObject(featureWithoutBordure, {});
  const parcelle1Area = calculateArea(parcelle1Geometry);

  const parcelle2Geometry = new GeoJSON().writeFeatureObject(res, {});
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
          <div style="font-weight: bold; margin-bottom: 4px;">Découpe de la parcelle : ${text}</div>
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

  hasBorder.value = true;
  previewBorderSource?.addFeature(res);
}

function getSplittingLine(projectionDistance: number, geometry: Geometry, buffer: Geometry) {
  const polygon = geometry.getCoordinates()[0];
  if (startSegmentIndex == -1 || endSegmentIndex == -1 || !startBorderPoint || !endBorderPoint || !targetFeature)
    return null;

  const startPoint = proj4("EPSG:4326", "EPSG:3857", [startBorderPoint[0], startBorderPoint[1]]);
  const endPoint = proj4("EPSG:4326", "EPSG:3857", [endBorderPoint[0], endBorderPoint[1]]);
  const startSlope = calculateSlope(
    polygon[startSegmentIndex],
    polygon[(startSegmentIndex + 1) % (polygon.length - 1)],
  );
  const endSlope = calculateSlope(polygon[endSegmentIndex], polygon[(endSegmentIndex + 1) % (polygon.length - 1)]);

  // Calculer les points A et B
  let pointA = calculateDestinationPoint(startPoint, projectionDistance, startSlope);
  let extendedStartPoint = calculateDestinationPoint(startPoint, -1, startSlope);
  if (!isPointInPolygon(pointA, geometry)) {
    pointA = calculateDestinationPoint(startPoint, -projectionDistance, startSlope);
    extendedStartPoint = calculateDestinationPoint(startPoint, 1, startSlope);
  }

  if (!isPointInPolygon(pointA, geometry)) {
    throw new Error("Bordure plus grande que la parcelle");
  }

  let pointB = calculateDestinationPoint(endPoint, projectionDistance, endSlope);
  let extendedEndPoint = calculateDestinationPoint(endPoint, -1, endSlope);
  if (!isPointInPolygon(pointB, geometry)) {
    pointB = calculateDestinationPoint(endPoint, -projectionDistance, endSlope);
    extendedEndPoint = calculateDestinationPoint(endPoint, 1, endSlope);
  }

  if (!isPointInPolygon(pointB, geometry)) {
    throw new Error("Bordure plus grande que la parcelle");
  }

  const points = [];
  for (let i = startSegmentIndex; i % (polygon.length - 1) != endSegmentIndex % (polygon.length - 1); i++) {
    let startPoint = polygon[i % (polygon.length - 1)];
    const nextPoint =
      i + 1 === endSegmentIndex ? calculateMidpoint(startPoint, endPoint) : polygon[(i + 1) % (polygon.length - 1)];

    if (i === startSegmentIndex) {
      startPoint = calculateMidpoint(nextPoint, startPoint);
    }

    const slope = calculateSlope(startPoint, nextPoint);
    let tmpPoint = calculateDestinationPoint(startPoint, projectionDistance * 5, slope);
    if (!isPointInPolygon(tmpPoint, buffer)) {
      tmpPoint = calculateDestinationPoint(startPoint, -projectionDistance * 5, slope);
    }

    if (isPointInPolygon(tmpPoint, buffer)) {
      points.push(tmpPoint);
    }
    tmpPoint = calculateDestinationPoint(nextPoint, projectionDistance * 5, slope);
    if (!isPointInPolygon(tmpPoint, buffer)) {
      tmpPoint = calculateDestinationPoint(nextPoint, -projectionDistance * 5, slope);
    }

    if (isPointInPolygon(tmpPoint, buffer)) {
      points.push(tmpPoint);
    }
  }

  const lineCoordinates = [extendedStartPoint, startPoint, pointA, ...points, pointB, endPoint, extendedEndPoint];

  return new LineString(lineCoordinates);
}

/*
 * * Utils
 */

export function updateOverlay(
  overlay: Overlay,
  pos: number[],
  value: number | string,
  unit: string,
  bold = false,
): void {
  overlay.setPosition(pos);
  const content = bold ? `<b>${value} ${unit}</b>` : `${value} ${unit}`;
  overlay.getElement().innerHTML = content;
}

export function cleanupPreview(previewSource: VectorSource | null): void {
  currentOverlays.forEach((overlay) => {
    map.removeOverlay(overlay);
  });
  currentOverlays = [];

  previewSource?.clear();
}

function calculateArea(feature: Feature): string {
  return inHa(legalProjectionSurface(feature));
}

function calculateSlope(startPoint: Coordinate, endPoint: Coordinate) {
  const slope = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]);

  return -1 / slope;
}

function calculateDestinationPoint(startPoint: Coordinate, distance: number, slope: number) {
  const x = startPoint[0] + distance / Math.sqrt(1 + slope * slope);
  const y = startPoint[1] + slope * (x - startPoint[0]);
  return [x, y];
}

function calculateMidpoint(pointA: number[], pointB: number[]) {
  return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2];
}

function isPointInPolygon(point: Coordinate, geom: Geometry) {
  return geom.intersectsCoordinate(point);
}

function squaredDistance(point1: Coordinate, point2: Coordinate) {
  const p1 = proj4("EPSG:4326", "EPSG:3857", point1);
  const p2 = proj4("EPSG:4326", "EPSG:3857", point2);
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
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
  closestPoint = null;
  closestSegmentIndex = -1;
  startBorderPoint = null;
  endBorderPoint = null;
  startSegmentIndex = -1;
  endSegmentIndex = -1;
  hasBorder.value = false;

  if (dragStart) {
    map.removeInteraction(dragStart);
    dragStart = null;
  }
  if (dragEnd) {
    map.removeInteraction(dragEnd);
    dragEnd = null;
  }
  if (changeBorder) {
    map.removeInteraction(changeBorder);
    changeBorder = null;
  }

  if (previewClosestPointLayer) {
    cleanupPreview(previewClosestPointLayer.getSource());
    map.removeLayer(previewClosestPointLayer);
    previewClosestPointLayer = null;
  }

  if (previewStartPointLayer) {
    cleanupPreview(previewStartPointLayer.getSource());
    map.removeLayer(previewStartPointLayer);
    previewStartPointLayer = null;
  }
  if (previewEndPointLayer) {
    cleanupPreview(previewEndPointLayer.getSource());
    map.removeLayer(previewEndPointLayer);
    previewEndPointLayer = null;
  }
  if (previewBorderLayer) {
    cleanupPreview(previewBorderLayer.getSource());
    map.removeLayer(previewBorderLayer);
    previewBorderLayer = null;
  }
}

function invertSelection() {
  isInverted = !isInverted;
  if (startBorderPoint && endBorderPoint) {
    drawBorder();
  }
}

function toggleAllBorder() {
  allBorder = !allBorder;
  hasBorder.value = allBorder;
  previewClosestPointSource?.clear();
  previewStartPointSource?.clear();
  previewEndPointSource?.clear();
  if (allBorder) {
    map.un("pointermove", handlePointerMove);
    map.un("click", handleMapClick);
    drawBorder();
  } else {
    previewBorderSource?.clear();
    currentOverlays.forEach((overlay) => {
      map.removeOverlay(overlay);
    });
    currentOverlays = [];
    if (!endBorderPoint) {
      map.on("pointermove", handlePointerMove);
      map.on("click", handleMapClick);
    }
    drawPoints();
  }
}

function setDistance() {
  if ((!isNaN(distance.value) && startBorderPoint && endBorderPoint) || allBorder) {
    drawBorder();
  }
}

function getBorderLayer() {
  return previewBorderLayer;
}

function movePoint(event: any) {
  if (!previewStartPointSource || !previewEndPointSource) return null;

  const coordinate = event.coordinate;
  const geometry = targetFeature?.getGeometry();
  closestPoint = geometry?.getClosestPoint(coordinate);
  if (!closestPoint) {
    return null;
  }
  previewStartPointSource.clear();
  previewEndPointSource.clear();

  drawPoints();

  const coordinates = geometry?.getCoordinates()[0];
  let minSquaredDistance = Infinity;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[(i + 1) % (coordinates.length - 1)];
    const line = new LineString([start, end]);
    const segmentClosestPoint = line.getClosestPoint(coordinate);
    const sqDist = squaredDistance(segmentClosestPoint, coordinate);
    if (sqDist < minSquaredDistance) {
      minSquaredDistance = sqDist;
      closestSegmentIndex = i;
    }
  }

  return { point: closestPoint, segment: closestSegmentIndex };
}

export { cleanup, borderInteraction, drawBorder, invertSelection, getBorderLayer, setDistance, toggleAllBorder };
