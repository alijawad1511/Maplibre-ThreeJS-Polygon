import { Vector3 } from "three";
import {
  MERCATOR_A,
  DEG2RAD,
  PROJECTION_WORLD_SIZE,
  EARTH_CIRCUMFERENCE,
  WORLD_SIZE,
} from "./constants.js";
import { LngLatLike } from "maplibre-gl";

export function projectToWorld(coords: Array<number>) {
  var projected = [
    -MERCATOR_A * DEG2RAD * coords[0] * PROJECTION_WORLD_SIZE,
    -MERCATOR_A *
      Math.log(Math.tan(Math.PI * 0.25 + 0.5 * DEG2RAD * coords[1])) *
      PROJECTION_WORLD_SIZE,
  ];

  if (!coords[2]) projected.push(0);
  else {
    var pixelsPerMeter = projectedUnitsPerMeter(coords[1]);
    projected.push(coords[2] * pixelsPerMeter);
  }

  var result = new Vector3(projected[0], projected[1], projected[2]);

  return result;
}

function projectedUnitsPerMeter(latitude: number) {
  return Math.abs(
    WORLD_SIZE / Math.cos(DEG2RAD * latitude) / EARTH_CIRCUMFERENCE
  );
}

export function unprojectFromWorld(worldUnits: Vector3) {
  var unprojected = [
    -worldUnits.x / (MERCATOR_A * DEG2RAD * PROJECTION_WORLD_SIZE),
    (2 *
      (Math.atan(
        Math.exp(worldUnits.y / (PROJECTION_WORLD_SIZE * -MERCATOR_A))
      ) -
        Math.PI / 4)) /
      DEG2RAD,
  ];

  var pixelsPerMeter = projectedUnitsPerMeter(unprojected[1]);

  //z dimension
  var height = worldUnits.z || 0;
  unprojected.push(height / pixelsPerMeter);

  return unprojected as LngLatLike;
}
