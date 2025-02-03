import * as THREE from 'three';


export class HelicopterPredictionBox {
    private boxMesh: THREE.Mesh;

    constructor(size: THREE.Vector3,color = 0xff0000, opacity = 0.5) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            wireframe: false,
        });

        this.boxMesh = new THREE.Mesh(geometry, material);
    }

    setPosition(x: number, y: number, z: number) {
        this.boxMesh.position.set(x, y, z);
    }

    setScale(x: number, y: number, z: number) {
        this.boxMesh.scale.set(x, y, z);
    }

    /**
     * Show probabilistic prediction box of Helicopter
     * 
     * @returns {THREE.Mesh} - Mesh of Probabilitic Box
     */
    getMesh(): THREE.Mesh {
        return this.boxMesh;
    }

    /**
     * Show Helicopter Probabilistic Prediction Box in the scene/world
     */
    show() {
        this.boxMesh.visible = true;
    }

    /**
     * Hide Helicopter Probabilistic Prediction Box from the scene/world
     */
    hide() {
        this.boxMesh.visible = false;
    }
}