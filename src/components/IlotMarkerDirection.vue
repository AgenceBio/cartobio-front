<template>
    
    <MglMarker :coordinates="hoveredIlotCoordinates" :draggable="false" :rotate="45" @added="onMarkerCreated">
        <div slot="marker" class="flex row pa-3">
            <div class="text-xs-center">
            <v-chip>{{hoveredIlotName}}</v-chip>
            </div>
            <v-icon :style="angleRotationStyle">near_me</v-icon>
        </div>
    </MglMarker>
</template>
<script>
import {MglMarker} from "vue-mapbox"
import polygonToLine from "@turf/polygon-to-line"
import lineIntersect from "@turf/line-intersect"
import calcAngle from "@turf/angle"
import {lineString} from "turf"

export default {
  name: "IlotMarkerDirection",
  props: ['ilotCenterCoordinates', 'bboxMap', 'mapBounds', 'mapCenter', 'hoveredIlotName'],
  components: {
    MglMarker
  },
  data() {
    return {
      hoveredIlotCoordinates: [0,0],
      angleRotationStyle: '',
      
    }
  },
  methods: {
    onMarkerCreated () {
      this.showIlotLocation();
      // marker.setMaxWidth('340px')
    },
    showIlotLocation() {
      // get the intersection in map bounds towards the ilot
      let mapOuterLine = polygonToLine(this.bboxMap);
      let line = lineString([this.mapCenter, this.ilotCenterCoordinates]);
      let intersect = lineIntersect(line, mapOuterLine);
      this.hoveredIlotCoordinates = intersect.features[0].geometry.coordinates;
      let rotationAngle = this.getArrowRotationAngle(this.mapCenter, intersect.features[0].geometry.coordinates);
      this.angleRotationStyle = "transform : rotate(" + rotationAngle + "deg)";
    },
    getArrowRotationAngle(mapCenter, intersectionPoint) {
      // calcAngle : StartPoint, Intersectionpoint, EndPoint
      // getEndPoint => next map corner in clockwise rotation ?
      let bounds = this.mapBounds;
      let corner =  [];

      let angleCorrection = -45; // default rotation of arrow icon = 45°

      let explementary = false;
      if (intersectionPoint[0] === bounds._ne.lon) {
        corner = bounds._ne.toArray();
      } else if (intersectionPoint[1] === bounds._ne.lat) {
        corner = bounds._ne.toArray();
        angleCorrection -= 90;
        if (intersectionPoint[0] > mapCenter[0]) {
          explementary = true;
        } else {
          explementary = false;
        }
      } else if (intersectionPoint[0] === bounds._sw.lon) {
        corner = bounds._sw.toArray();
        angleCorrection += 180;
      } else if (intersectionPoint[1] === bounds._sw.lat) {
        corner = bounds._sw.toArray();
        angleCorrection += 90;
      } else {
        corner = [0,0];
      }
      return calcAngle(mapCenter, intersectionPoint, corner, {explementary: explementary}) + angleCorrection;
    }
  }
}
</script>
<style lang="scss" scoped>

</style>