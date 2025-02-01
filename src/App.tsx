import { useEffect, useRef } from "react";
// import maplibregl, { CustomLayerInterface, Map } from "maplibre-gl";
import {Map, MercatorCoordinate} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import CustomThreeJSWrapper from "./CustomThreeJsWrapper/CustomThreeJsWrapper";
import * as turf from "@turf/turf";
import * as THREE from "three";
import { projectToWorld, unprojectFromWorld } from "./CustomThreeJsWrapper/utility/utils";
import { Text } from "troika-three-text";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface Content3DLayer {
  id: string;
  type: "custom";
  renderingMode: "3d";
  render(): void;
}

const MAPTILER_KEY = "sjn0iuxKyGPkOiVCMU8R";

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>();
  const wrapper = useRef<CustomThreeJSWrapper | null>(null);

  const content3DLayer: Content3DLayer = {
    id: "custom-threejs-layer",
    type: "custom",
    renderingMode: "3d",

    render() {
      if (wrapper.current) wrapper.current.update();
    },
  };

  useEffect(() => {
    if (!map.current) {
      map.current = new Map({
        container: mapContainer.current as HTMLElement,
        style: `https://api.maptiler.com/maps/bright-v2-light/style.json?key=${MAPTILER_KEY}`,
        // style: `https://demotiles.maplibre.org/style.json`,
        center: [76.364002417407, 10.007096298394828],
        zoom: 18,
        accessToken: 'pk.eyJ1IjoiaGFtemF0bXQiLCJhIjoiY200amlueml0MGhraTJsc2gwaHB2b3A3eSJ9.NkMv_GwtZtYWUT1nx_WJqQ',
      });
  
      map.current.on("load", function () {  
        if (!map.current?.getLayer("custom-threejs-layer")) {
          map.current?.addLayer(content3DLayer);
        }
  
        wrapper.current = new CustomThreeJSWrapper(
          map.current as any,
          map.current?.getCanvas().getContext("webgl") as WebGLRenderingContext
        );
        wrapper.current.initDefaultLights();
  
        console.log("Wrapper:", wrapper.current);

        const loader = new GLTFLoader();
        loader.load('car.glb', (data: GLTF) => {
          console.log('data', data.scene);
          const center = map.current?.getCenter().toArray();
          const altitude = 100;
          const pos = projectToWorld([center[0], center[1], altitude]);
          console.log(pos);
          const model = data.scene;
          model.rotateX(Math.PI/2);
          model.position.set(pos.x, pos.y, pos.z - 2);
          wrapper.current?.add(model);

          
          let bearingProgress = 0;
          let bearingDirection = 1;
          const animateCarMovement = () => {
            model.position.y -= 0.1;
            if (map.current) {
              const camera = map.current.getFreeCameraOptions();
              camera.position = MercatorCoordinate.fromLngLat(unprojectFromWorld(model.position), altitude);

              // Lerp bearing between 60 and -60 degrees
              bearingProgress += 0.01 * bearingDirection;
              
              // Reverse direction when reaching extremes
              if (bearingProgress >= 1 || bearingProgress <= -1) {
                bearingDirection *= -1;
              }
              
              // Interpolate bearing using smoothstep for more natural motion
              const smoothProgress = bearingProgress * bearingProgress * (3 - 2 * bearingProgress);
              const bearing = 90 * (1 - smoothProgress) + (-90) * smoothProgress;
              
              camera.setPitchBearing(80, 0);

              // camera.setPitchBearing(80, 0);
              map.current.setFreeCameraOptions(camera);

              map.current?.triggerRepaint();
            }
          }
          wrapper.current?.addOnRenderListener(animateCarMovement);
        })

        map.current?.on('moveend', () => {
          console.log(map.current?.getBearing(), map.current?.getPitch());
        })
      });
    }

    return () => {
      // Clean up and release all internal resources associated
      // if (map.current) map.current.remove();
    };
  }, []);

  return (
    <>
      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>
    </>
  );
}

export default App;
