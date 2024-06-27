import * as THREE from "three";
import { Map, CustomLayerInterface } from "maplibre-gl";
import CustomThreeJSWrapper from "./CustomThreeJsWrapper/CustomThreeJsWrapper";
import * as turf from "@turf/turf";
import { projectToWorld } from "./CustomThreeJsWrapper/utility/utils";
import { Text } from "troika-three-text";

// Interfaces
interface Content3DLayer extends CustomLayerInterface {
  id: string;
  type: "custom";
  renderingMode: "3d";
  render(): void;
}

const mapContainer = document.getElementById("map");
const MAPTILER_KEY = "sjn0iuxKyGPkOiVCMU8R";

const map = new Map({
  container: mapContainer as HTMLElement,
  style: `https://api.maptiler.com/maps/bright-v2-light/style.json?key=${MAPTILER_KEY}`,
  // style: `https://demotiles.maplibre.org/style.json`,
  center: [76.364002417407, 10.007096298394828],
  zoom: 18,
});

const polygonsCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        image: "./sk.png",
        label: "Demo Label 1",
        color: "#89CFF0",
        height: 0,
      },
      geometry: {
        coordinates: [
          [
            [76.364002417407, 10.007096298394828],
            [76.36437211475851, 10.007226054442015],
            [76.36447573235478, 10.00697662044216],
            [76.36409068424797, 10.00685442290738],
            [76.364002417407, 10.007096298394828],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: {
        image: "./sk.png",
        label: "Demo Label 1",
        color: "#87cefa",
        height: 3,
      },
      geometry: {
        coordinates: [
          [
            [76.359002417407, 10.007096298394828],
            [76.35937211475851, 10.007226054442015],
            [76.35947573235478, 10.00697662044216],
            [76.35909068424797, 10.00685442290738],
            [76.359002417407, 10.007096298394828],
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
        height: 0,
      },
      geometry: {
        coordinates: [
          [
            [76.3650024, 10.007096298394828],
            [76.365372114, 10.007226054442015],
            [76.365475732, 10.00697662044216],
            [76.36509068, 10.00685442290738],
            [76.3650024, 10.007096298394828],
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
        height: 6,
      },
      geometry: {
        coordinates: [
          [
            [76.358002417407, 10.007096298394828],
            [76.35837211475851, 10.007226054442015],
            [76.35847573235478, 10.00697662044216],
            [76.35809068424797, 10.00685442290738],
            [76.358002417407, 10.007096298394828],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

let wrapper: CustomThreeJSWrapper | null = null;

const content3DLayer: Content3DLayer = {
  id: "custom-threejs-layer",
  type: "custom",
  renderingMode: "3d",

  render() {
    if (wrapper) wrapper.update();
  },
};

map.on("load", () => {
  // Polygon Source
  map.addSource("polygonSource", {
    type: "geojson",
    data: polygonsCollection as any,
  });

  // Polygon Layer
  map.addLayer({
    id: "polygonLayer",
    type: "fill",
    source: "polygonSource",
    layout: {},
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.5,
    },
  });

  // Extrusion Layer
  map.addLayer({
    id: "polygonExtrusion",
    type: "fill-extrusion",
    source: "polygonSource",
    paint: {
      "fill-extrusion-color": ["get", "color"],
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-opacity": 1,
    },
  });

  if (!map.getLayer("custom-threejs-layer")) {
    map.addLayer(content3DLayer);
  }

  wrapper = new CustomThreeJSWrapper(
    map as any,
    map.getCanvas().getContext("webgl") as WebGLRenderingContext
  );

  let items: any[] = [];
  // Add Texture at Center
  polygonsCollection.features.map((feature: any) => {
    let coordinates = feature.geometry.coordinates;
    // Calculate the centroid of the polygon
    const polygon = turf.polygon(coordinates);
    const centroid = turf.center(polygon).geometry.coordinates;

    const modelPosition = projectToWorld(centroid);

    const vertex1 = projectToWorld(coordinates[0][0]);
    const vertex2 = projectToWorld(coordinates[0][1]);
    const angle = vertex1.angleTo(vertex2);
    console.log(angle);

    if (feature.properties.image === "") {
      // Add Text instead of Image
      // Add Text as alternative of Image
      const myText = new Text();

      // Set properties to configure:
      myText.text = feature.properties.label;
      myText.fontSize = 100;
      const textPosition = projectToWorld(centroid);
      console.log("Text Position:", textPosition);
      myText.color = 0xff0000;
      myText.rotation.x = Math.PI;
      myText.rotation.y = Math.PI;

      // Setting Anchor at Center of Text
      myText.anchorX = "50%";
      myText.anchorY = "50%";
      console.log("Text:", myText);

      wrapper?.add(myText);
      console.log("Wrapper: ", wrapper);

      // Update the rendering:
      myText.sync(() => {
        // const geojsonbbox = turf.bbox(polygon);

        // const bbox1 = new THREE.Box3(projectToWorld([geojsonbbox[2], geojsonbbox[3]]), projectToWorld([geojsonbbox[0], geojsonbbox[1]]));
        // const bbox2 = new THREE.Box3().setFromObject(myText);

        // console.log('1', geojsonbbox)

        // const size1 = new THREE.Vector3();
        // bbox1.getSize(size1);
        // size1.setZ(1);

        // const size2 = new THREE.Vector3();
        // bbox2.getSize(size2);
        // size2.setZ(1);

        // const ratio = size1.divide( size2 );
        // console.log('ratio: ',size1, size2, ratio);
        // myText.scale.set(myText.scale.x * (ratio.x), myText.scale.y * (ratio.y), myText.scale.z * (ratio.z));

        myText.scale.set(0.00095, 0.00095, 1); // Scale calculationn hard coded for now
        myText.position.set(
          textPosition.x,
          textPosition.y,
          feature.properties.height > 0 ? 0.2 : 0.01
        );
        myText.rotateZ(Math.PI / 9);

        items.push(myText);

        map.repaint = true;
      });
    } else {
      // Load Texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(feature.properties.image, (texture: THREE.Texture) => {
        // Create a plane geometry and material with the loaded texture
        const geometry = new THREE.PlaneGeometry(
          texture.image.width,
          texture.image.height
        );
        geometry.computeBoundingBox();
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true, // Enable transparency
          opacity: 1,
        });
        const plane = new THREE.Mesh(geometry, material);

        const group = new THREE.Group();
        const childContainer = new THREE.Group();
        childContainer.add(plane);
        childContainer.rotateZ(Math.PI);
        childContainer.rotateZ(Math.PI / 9);
        childContainer.updateMatrixWorld();

        group.add(childContainer);

        const geojsonbbox = turf.bbox(polygon);

        const bbox1 = new THREE.Box3(
          projectToWorld([geojsonbbox[2], geojsonbbox[3]]),
          projectToWorld([geojsonbbox[0], geojsonbbox[1]])
        );
        const bbox2 = new THREE.Box3().setFromObject(plane);

        console.log("1");

        const size1 = new THREE.Vector3();
        bbox1.getSize(size1);
        size1.setZ(1);

        const size2 = new THREE.Vector3();
        bbox2.getSize(size2);
        size2.setZ(1);

        const ratio = size1.divide(size2);

        const ratioCopy = ratio.clone().multiplyScalar(0.85);

        plane.scale.set(
          plane.scale.x * ratioCopy.x,
          plane.scale.y * ratioCopy.y,
          plane.scale.z * ratioCopy.z
        );

        // // Set the position of the plane to the centroid
        group.position.set(
          modelPosition.x,
          modelPosition.y,
          feature.properties.height > 0 ? 0.08 : 0.01
        );
        items.push(group);

        wrapper?.add(group);
      });
    }
    console.log(wrapper);
    wrapper?.repaint();
  });

  let currentstate = 1;
  // Getting Bearing of Map when moving camera...
  map.on("move", () => {
    // console.log("Bearing:", map.getBearing());
    // console.log("Map Data:", wrapper.scene.children[0]);
    const bearing = map.getBearing() as number;
    if (bearing < 90 && bearing > -90) {
      if (currentstate != 1) {
        for (let index = 0; index < items.length; index++) {
          const element = items[index];
          element.rotateZ(Math.PI);
        }
        // obj.translateX(-tex.image.height*2);
      }
      currentstate = 1;
    } else {
      if (currentstate != 2) {
        for (let index = 0; index < items.length; index++) {
          const element = items[index];
          element.rotateZ(Math.PI);
        }
        // obj.translateX(-tex.image.height*2);
      }
      currentstate = 2;
    }
  });
});
