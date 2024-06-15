import { useEffect, useRef } from "react";
import maplibregl, { CustomLayerInterface, Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CustomThreeJSWrapper from "./CustomThreeJsWrapper/CustomThreeJsWrapper";
import * as turf from "@turf/turf";
import * as THREE from "three";
import { projectToWorld } from "./CustomThreeJsWrapper/utility/utils";
import { Text } from "troika-three-text";

interface Content3DLayer extends CustomLayerInterface {
  id: string;
  type: "custom";
  renderingMode: "3d";
  render(): void;
}

const singlePolygon = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [74.31652671001302, 31.565873719350336],
            [74.31832543117767, 31.566178270078325],
            [74.3184522640806, 31.56481269614069],
            [74.31796799299701, 31.564753750052915],
            [74.31793340220537, 31.564517965328363],
            [74.31636528631844, 31.563938325348502],
            [74.31613468104072, 31.56410534062765],
            [74.31652671001302, 31.565873719350336],
          ],
        ],
      },
      id: "d98a5cd9-30df-41d7-a3c8-8e412361c7cf",
      properties: {
        city: "Lahore",
        country: "Pakistan",
      },
    },
  ],
};

const polygonsCollection: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        image: "./texture.jpg",
        label: "Demo Label 1",
        color: "#4141f1",
        height: 6,
      },
      geometry: {
        coordinates: [
          [
            [38.666815919931935, -0.9105611792161881],
            [38.666815919931935, -1.4639165870098054],
            [39.52171561959557, -1.4639165870098054],
            [39.52171561959557, -0.9105611792161881],
            [38.666815919931935, -0.9105611792161881],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: {
        image: "",
        label: "Demo Label 2",
        color: "#2dcabd",
        height: 3,
      },
      geometry: {
        coordinates: [
          [
            [37.71428164351423, -1.0200497179086483],
            [37.71428164351423, -1.462092082685757],
            [38.35515803705616, -1.462092082685757],
            [38.35515803705616, -1.0200497179086483],
            [37.71428164351423, -1.0200497179086483],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

const MAPTILER_KEY = "sjn0iuxKyGPkOiVCMU8R";

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>();
  const wrapper = useRef<CustomThreeJSWrapper | null>(null);
  const lat = 31.56506;
  const lng = 74.31729;

  const content3DLayer: Content3DLayer = {
    id: "custom-threejs-layer",
    type: "custom",
    renderingMode: "3d",

    render() {
      if (wrapper.current) wrapper.current.update();
    },
  };

  useEffect(() => {
    map.current = new Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/bright-v2-light/style.json?key=${MAPTILER_KEY}`,
      // style: `https://demotiles.maplibre.org/style.json`,
      center: [38.666815919931935, -0.9105611792161881],
      zoom: 8,
    });

    map.current.on("load", function () {
      if (!map.current?.getLayer("custom-threejs-layer")) {
        map.current?.addLayer(content3DLayer);
      }

      // Polygon Source
      map.current?.addSource("polygonSource", {
        type: "geojson",
        data: polygonsCollection,
      });

      // Polygon Layer
      map.current?.addLayer({
        id: "polygonLayer",
        type: "fill",
        source: "polygonSource",
        layout: {},
        paint: {
          "fill-color": "#4141f1",
          "fill-opacity": 0.5,
        },
      });

      // Extrusion Layer
      map.current?.addLayer({
        id: "polygonExtrusion",
        type: "fill-extrusion",
        source: "polygonSource",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-opacity": 1,
        },
      });

      wrapper.current = new CustomThreeJSWrapper(
        map.current as any,
        map.current?.getCanvas().getContext("webgl") as WebGLRenderingContext
      );

      console.log("Wrapper:", wrapper.current);

      // Add Texture at Center
      polygonsCollection.features.map((feature: any) => {
        console.log("Feature:", feature.properties.image);
        console.log("Polygon Coords:", feature.geometry.coordinates);

        // Calculate the centroid of the polygon
        const polygon = turf.polygon(feature.geometry.coordinates);
        const centroid = turf.center(polygon);

        console.log("Coordinates:", centroid.geometry.coordinates);

        const modelPosition = projectToWorld(centroid.geometry.coordinates);

        console.log("Model Position:", modelPosition);

        if (feature.properties.image === "") {
          // Add Text instead of Image
          // Add Text as alternative of Image
          const myText = new Text();
          wrapper.current?.add(myText);

          // Set properties to configure:
          myText.text = feature.properties.label;
          myText.fontSize = 100;
          const textPosition = projectToWorld(centroid.geometry.coordinates);
          console.log("Text Position:", textPosition);
          myText.position.set(
            textPosition.x,
            textPosition.y,
            textPosition.z + 10
          );
          myText.color = 0xff0000;
          myText.rotation.x = Math.PI;
          myText.rotation.y = Math.PI;
          console.log("Text:", myText);

          // Update the rendering:
          myText.sync();
        } else {
          // Load Texture
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load("./texture.jpg"); // path to your image

          // Create a plane geometry and material with the loaded texture
          const geometry = new THREE.PlaneGeometry(300, 300);
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const plane = new THREE.Mesh(geometry, material);

          // // Set the position of the plane to the centroid
          plane.position.set(
            modelPosition.x,
            modelPosition.y,
            modelPosition.z + 100
          );

          wrapper.current?.add(plane);
        }

        wrapper.current?.repaint();
      });
    });

    return () => {
      // Clean up and release all internal resources associated
      if (map.current) map.current.remove();
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
