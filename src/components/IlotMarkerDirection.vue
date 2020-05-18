<template>
    <MglMarker :coordinates="hoveredIlotCoordinates" :draggable="false" :rotate="45" @added="onMarkerCreated">
        <div slot="marker" class="flex">
          <v-card color="transparent" flat :style="offsetStyle">
            <v-layout :style="flexStyle" align-center>
              <v-flex><v-chip color="#b9d065">{{hoveredIlotName}}</v-chip></v-flex>
              <v-flex><v-icon color="#b9d065" :style="angleRotationStyle">near_me</v-icon></v-flex>
            </v-layout>
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
      offsetStyle: '',
      flexStyle: ''
    }
  },
  methods: {
    onMarkerCreated () {
      this.showIlotLocation();
    },
    showIlotLocation() {
      // get the intersection in map bounds towards the ilot
      let mapOuterLine = polygonToLine(this.bboxMap);
      let line = lineString([this.mapCenter, this.ilotCenterCoordinates]);
      let intersect = lineIntersect(line, mapOuterLine);
      this.hoveredIlotCoordinates = intersect.features[0].geometry.coordinates;
      let {rotationAngle, offset, flex} = this.calcStyleValues(this.mapCenter, intersect.features[0].geometry.coordinates);
      this.angleRotationStyle = "transform : rotate(" + rotationAngle + "deg)";
      this.offsetStyle = "transform : translate(" + offset[0] + "px, " + offset[1] + "px);";
      this.flexStyle = "flex-direction : " + flex + ";";
      console.log(this.offsetStyle, rotationAngle, this.flexStyle );
    },
    // calculates rotation angle, offset, and flex direction to display the marker properly
    /**
     * @param {Array} mapCenter center of the map
     * @param {Array} intersectionPoint intersection point between the map bounding box and the line between map center and ilot center 
     * @returns {Number} rotationAngle : the rotation angle to apply to the directional arrow
     * @returns {Array} offset : the offset in pixels to apply to the marker
     * @returns {String} flex : the flex-direction property to apply to the marker
     */
    calcStyleValues(mapCenter, intersectionPoint) {

      // calcAngle : StartPoint, Intersectionpoint, EndPoint
      // endPoint = north east or southwest point
      let bounds = this.mapBounds;
      // get a default corner value
      let corner = mapCenter;

      // angle correction depending on which endPoint we take. Default rotation of arrow icon = 45°
      let angleCorrection = -45;
      // do we take the explementary angle or not
      let explementary = false;

      // offset of the marker
      let offset = [0,0];
      
      // flex-direction attribute value (row, column, reverse?)
      let flex = '';

      // ilot is on the right of the map
      if (intersectionPoint[0] === bounds._ne.lng) {
        corner = bounds._ne.toArray();
        offset = [-60, 0];
        angleCorrection += 180;
        explementary = true;
        flex = 'row';
      } 
      // ilot is above the map
      else if (intersectionPoint[1] === bounds._ne.lat) {
        corner = bounds._ne.toArray();
        offset = [0, 40];
        angleCorrection -= 90;
        flex = 'column-reverse';
        // depending if the ilot is on left or right part, we may need explementary angle
        if (intersectionPoint[0] > mapCenter[0]) {
          explementary = true;
        } else {
          explementary = false;
        }
      } 
      // ilot is on the left of the map 
      else if (intersectionPoint[0] === bounds._sw.lng) {
        offset = [60, 0];
        corner = bounds._sw.toArray();
        flex = 'row-reverse';
      } 
      // ilot is under the map
      else if (intersectionPoint[1] === bounds._sw.lat) {
        offset = [0, -40];
        corner = bounds._sw.toArray();
        angleCorrection += 90;
        flex = 'column';
      }
      return {
        rotationAngle : calcAngle(mapCenter, intersectionPoint, corner, {explementary: explementary}) + angleCorrection,
        offset : offset,
        flex: flex
      };
    }
  }
}
</script>
<style lang="scss" scoped>

</style>