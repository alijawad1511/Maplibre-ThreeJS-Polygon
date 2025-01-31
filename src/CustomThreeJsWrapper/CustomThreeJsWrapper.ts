import { Map } from "mapbox-gl";
import {
  AmbientLight,
  DataTexture,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import * as THREE from "three";
import { FOV_DEGREES } from "./utility/constants.js";
import CameraSync from "./utility/CameraSync.js";
import * as turf from "@turf/turf";
import { projectToWorld } from "./utility/utils.js";
import { Text } from "troika-three-text";

type RenderListener = () => void;

class CustomThreeJSWrapper {
  map!: Map;
  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  cameraSync!: CameraSync;
  fov: number;

  onRenderListeners: RenderListener[] = [];

  constructor(map: Map, gl: WebGLRenderingContext) {
    this.scene = new Scene();

    this.map = map;

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: map.getCanvas(),
      context: gl,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.map.getCanvas().clientWidth,
      this.map.getCanvas().clientHeight
    );
    this.renderer.autoClear = false;

    this.fov = 60;

    const h = this.map.getCanvas().clientHeight;
    const w = this.map.getCanvas().clientWidth;

    this.map.transform.fov = this.fov;
    console.log("fov", this.fov)
    this.camera = new PerspectiveCamera(
    );

    this.cameraSync = new CameraSync(map, this.camera, this.scene);

    // this.init();
  }

  init() {
    const myText = new Text();
    this.scene.add(myText);

    // Set properties to configure:
    myText.text = "Hello world!";
    myText.fontSize = 500;
    const textPosition = projectToWorld([30.319262, 6.340976]);
    console.log("Text Position:", textPosition);
    myText.position.set(textPosition.x, textPosition.y, textPosition.z);
    myText.color = 0xff0000;
    myText.rotation.x = Math.PI;
    myText.rotation.y = Math.PI;
    console.log("Text:", myText);
    // myText.color = "#4141f1";

    // Update the rendering:
    myText.sync();
    this.repaint();
  }

  repaint() {
    this.map.repaint = true;
  }

  async clear(layerId = null) {
    return new Promise((resolve, reject) => {
      let objects: THREE.Object3D[] = [];
      this.scene.children.forEach(function (object: THREE.Object3D) {
        objects.push(object);
      });
      for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        //if layerId, check the layer to remove, otherwise always remove
        if (obj.layers === layerId || !layerId) {
          this.remove(obj);
        }
      }

      resolve("clear");
    });
  }

  add(object: Object3D) {
    this.scene.add(object);
  }

  initDefaultLights() {
    const light = new AmbientLight(0x404040, 3); // soft white light
    this.scene.add(light);
  }

  setEnvironment(texture: DataTexture) {
    const light = new AmbientLight(0x404040, 3); // soft white light
    this.scene.add(light);

    this.scene.environment = texture;
  }

  dispose(target: Object3D | Mesh) {
    if (target instanceof Mesh) {
      // If the target is a Mesh
      // Dispose materials and geometry of the mesh
      if (target.material) {
        if (
          typeof target.material.dispose === "function" &&
          !target.material._isDisposed
        ) {
          target.material.dispose();
          target.material._isDisposed = true;
        }
        target.material = null;
      }
      if (target.geometry) {
        if (
          typeof target.geometry.dispose === "function" &&
          !target.geometry._isDisposed
        ) {
          target.geometry.dispose();
          target.geometry._isDisposed = true;
        }
        target.geometry = null;
      }
    } else if (target instanceof Object3D) {
      // If the target is an Object3D
      target.removeFromParent();
      this.disposeObject(target);
    }
  }

  disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            this.disposeMaterial(material);
          });
        } else {
          this.disposeMaterial(child.material);
        }
      }
      if (child instanceof Mesh && child.geometry) {
        this.disposeGeometry(child.geometry);
      }
      if (child instanceof Mesh && child.material && child.material.map) {
        this.disposeTexture(child.material.map);
      }
      requestAnimationFrame(() => (child.children.length = 0));
    });

    if (object.parent) {
      object.parent.remove(object);
    }
  }

  disposeMaterial(material: THREE.Material) {
    if (material.dispose) {
      material.dispose();
    }
  }

  //  to dispose of a texture
  disposeTexture(texture: THREE.Texture) {
    if (texture.dispose) {
      texture.dispose();
    }
  }

  //  to dispose of a geometry
  disposeGeometry(geometry: THREE.BufferGeometry) {
    if (geometry.dispose) {
      geometry.dispose();
    }
  }

  remove(object: THREE.Object3D | null) {
    this.scene.remove(object as THREE.Object3D);
    object = null;
  }

  addOnRenderListener(onRenderListener: RenderListener) {
    this.onRenderListeners.push(onRenderListener);
  }

  update() {
    this.onRenderListeners.forEach(listener => {
      listener();
    });
    
    if (this.map.repaint) this.map.repaint = false;
    this.scene.updateMatrixWorld(true);

    // Render the scene and repaint the map
    this.renderer.resetState(); //update threejs r126
    this.renderer.render(this.scene, this.camera);
  }
}

export default CustomThreeJSWrapper;
