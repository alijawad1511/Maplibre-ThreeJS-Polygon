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
import { Cylinder3D } from "./Cylinder3D";
import { HelicopterPredictionBox } from './HelicopterPredictionBox';

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
        loader.load('plane.glb', (data: GLTF) => {
          console.log('data', data.scene);
          const center = map.current?.getCenter().toArray();
          const altitude = 400;
          const pos = projectToWorld([center[0], center[1], altitude]);
          console.log(pos);
          const model = data.scene;
          model.rotateX(Math.PI/2);
          model.position.set(pos.x, pos.y, pos.z);
          model.scale.set(0.002, 0.002, 0.002);
          wrapper.current?.add(model);

          // Add Probablistic Volume for Helicopter
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const boxCenter = new THREE.Vector3();
          box.getCenter(boxCenter);

          // const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
          // const boxMaterial = new THREE.MeshBasicMaterial({
          //   color: 0xff0000,
          //   transparent: true, // Disable transparency for debugging
          //   opacity: 0.4, // Full visibility
          //   wireframe: false, // Enable wireframe mode to see edges clearly
          // });

          // const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
          // boxMesh.position.set(model.position.x, model.position.y, model.position.z + 0.6);
          // boxMesh.scale.set(0.015, 0.015, 0.015);
          // wrapper.current?.add(boxMesh);

          const helicopterBox = new HelicopterPredictionBox(size, 0xff0000, 0.5);
          helicopterBox.setPosition(model.position.x, model.position.y, model.position.z + 0.6);
          helicopterBox.setScale(0.015, 0.015, 0.015);
          const boxMesh = helicopterBox.getMesh();
          wrapper.current?.add(boxMesh);

          // Add Probablistic Volume for Plane
          // const cylinder = new Cylinder3D(2, 0.3, 8, 0x00ff00, 0.5);
          // const helicopterPos = model.position; // Use helicopter model's position
          // cylinder.setPosition(helicopterPos.x + 4, helicopterPos.y, helicopterPos.z + 0.1);
          // const cylinderMesh = cylinder.getMesh();
          // cylinderMesh.rotateZ(-Math.PI / 2);
          // wrapper.current?.add(cylinderMesh);

          
          let bearingProgress = 0;
          let bearingDirection = 2;

          // Initial Camera Position
          const camera = map.current?.getFreeCameraOptions();
          if (camera) {
            const cameraPosition = model.position.clone();
            cameraPosition.y += 10;
            camera.position = MercatorCoordinate.fromLngLat(unprojectFromWorld(cameraPosition), altitude + 50);
            camera.setPitchBearing(80, 0);
            map.current?.setFreeCameraOptions(camera);
          }

          const animateCarMovement = () => {
            model.position.x += 0.1;
            boxMesh.position.x += 0.1;
            // cylinderMesh.position.x += 0.1;
            if (map.current) {
              // const camera = map.current.getFreeCameraOptions();
              // const cameraPosition = model.position.clone();
              // cameraPosition.y += 5;
              // camera.position = MercatorCoordinate.fromLngLat(unprojectFromWorld(cameraPosition), altitude + 50); // 50 for Camera adjustment from ground level to center of helicopter

              // // Lerp bearing between 60 and -60 degrees
              // bearingProgress += 0.01 * bearingDirection;
              
              // // Reverse direction when reaching extremes
              // if (bearingProgress >= 1 || bearingProgress <= -1) {
              //   bearingDirection *= -1;
              // }
              
              // // Interpolate bearing using smoothstep for more natural motion
              // const smoothProgress = bearingProgress * bearingProgress * (3 - 2 * bearingProgress);
              // const bearing = 90 * (1 - smoothProgress) + (-90) * smoothProgress;
              
              // camera.setPitchBearing(80, 0);

              // // camera.setPitchBearing(80, 0);
              // map.current.setFreeCameraOptions(camera);

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
