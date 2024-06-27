import { Map } from "maplibre-gl";

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

const content3DLayer = {
  id: "custom-threejs-layer",
  type: "custom",
  renderingMode: "3d",

  render() {
    // if (wrapper.current) wrapper.current.update();
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
    map.addLayer(content3DLayer as any);
  }
});
