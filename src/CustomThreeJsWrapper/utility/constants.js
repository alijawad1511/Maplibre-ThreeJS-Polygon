// constants.js
export const WORLD_SIZE = 1024000; // TILE_SIZE * 2000
export const MERCATOR_A = 6378137.0; // 900913 projection property. (Deprecated) Replaced by EARTH_RADIUS
export const FOV_ORTHO = 0.1 / 180 * Math.PI; // Mapbox doesn't accept 0 as FOV
export const FOV = Math.atan(3 / 4); // from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/main/src/geo/transform.js#L93
export const EARTH_RADIUS = 6371008.8; // from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L11
export const EARTH_CIRCUMFERENCE_EQUATOR = 40075017; // from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L117

export const PROJECTION_WORLD_SIZE = WORLD_SIZE / (EARTH_RADIUS * Math.PI * 2);
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS; // 40075000, // In meters
export const TILE_SIZE = 512;
export const FOV_DEGREES = FOV * 180 / Math.PI; // Math.atan(3/4) in degrees
