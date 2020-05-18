<template>
    <MglMarker :coordinates="hoveredIlotCoordinates" :draggable="false" :rotate="45" @added="onMarkerCreated">
        <div slot="marker" class="flex">
          <v-card color="transparent" flat :style="offsetStyle">
            <v-chip>{{hoveredIlotName}}</v-chip>
            <v-icon :style="angleRotationStyle">near_me</v-icon>
          </v-card>
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
      // Anchor options are 'center' , 'top' , 'bottom' , 'left' , 'right' , 'top-left' , 'top-right' , 'bottom-left' , and 'bottom-right'
      // offset: [0,0],
      offsetStyle: ''
    }
  },
  methods: {
    onMarkerCreated (e) {
      this.showIlotLocation();
      let marker = e.marker;
      console.log(marker);
      // marker._offset =  this.offset;
      // marker._update();
    },
    showIlotLocation() {
      // get the intersection in map bounds towards the ilot
      let mapOuterLine = polygonToLine(this.bboxMap);
      let line = lineString([this.mapCenter, this.ilotCenterCoordinates]);
      let intersect = lineIntersect(line, mapOuterLine);
      this.hoveredIlotCoordinates = intersect.features[0].geometry.coordinates;
      let {rotationAngle, offset} = this.getStyleNumbers(this.mapCenter, intersect.features[0].geometry.coordinates);
      // let rotationAngle = this.getStyleNumbers(this.mapCenter, intersect.features[0].geometry.coordinates);
      this.angleRotationStyle = "transform : rotate(" + rotationAngle + "deg)";
      this.offsetStyle = "transform : translate(" + offset[0] + "px, " + offset[1] + "px);";
      console.log(this.offsetStyle, rotationAngle);
    },
    getStyleNumbers(mapCenter, intersectionPoint) {
      // calcAngle : StartPoint, Intersectionpoint, EndPoint
      // getEndPoint => next map corner in clockwise rotation ?
      let bounds = this.mapBounds;
      let corner =  [];

      let angleCorrection = -45; // default rotation of arrow icon = 45°
      let offset = [0,0];
      let explementary = false;
      
      if (intersectionPoint[0] === bounds._ne.lon) {
        corner = bounds._ne.toArray();
        offset = [30, 0];
      } else if (intersectionPoint[1] === bounds._ne.lat) {
        corner = bounds._ne.toArray();
        offset = [0, 30];
        angleCorrection -= 90;
        if (intersectionPoint[0] > mapCenter[0]) {
          explementary = true;
        } else {
          explementary = false;
        }
      } else if (intersectionPoint[0] === bounds._sw.lon) {
        offset = [-30, 0];
        corner = bounds._sw.toArray();
        angleCorrection += 180;
      } else if (intersectionPoint[1] === bounds._sw.lat) {
        offset = [0, -30];
        corner = bounds._sw.toArray();
        angleCorrection += 90;
      } else {
        corner = [0,0];
      }
      
      return {
        rotationAngle : calcAngle(mapCenter, intersectionPoint, corner, {explementary: explementary}) + angleCorrection,
        offset : offset
      };
    }
  }
}
</script>
<style lang="scss" scoped>

</style>