import * as THREE from 'three';


export class Cylinder3D {
    private cylinderMesh: THREE.Mesh;

    constructor(radiusTop = 15, radiusBottom = 5, height = 40, color = 0xff0000, opacity = 0.5) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            wireframe: false,
        });

        this.cylinderMesh = new THREE.Mesh(geometry, material);
    }

    setPosition(x: number, y: number, z: number) {
        this.cylinderMesh.position.set(x, y, z);
    }

    setScale(x: number, y: number, z: number) {
        this.cylinderMesh.scale.set(x, y, z);
    }

    getMesh() {
        return this.cylinderMesh;
    }

    /**
     * Show Helicopter Probabilistic Prediction Box in the scene/world
     */
    show() {
        this.cylinderMesh.visible = true;
    }

    /**
     * Hide Helicopter Probabilistic Prediction Box from the scene/world
     */
    hide() {
        this.cylinderMesh.visible = false;
    }
}