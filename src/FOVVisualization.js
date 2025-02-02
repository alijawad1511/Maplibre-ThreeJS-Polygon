import * as THREE from 'three';

export class FOVVisualization {
  constructor(camera, mainColor = 0x00ff00, farPlaneColor = 0x0000ff, opacity = 0.2, farPlaneSegments = 20) {
    this.camera = camera;
    
    // Calculate the frustum dimensions
    // const fov = THREE.MathUtils.degToRad(camera.fov);
    // const aspect = camera.aspect;
    // const near = camera.near;
    // const far = camera.far;

    const fov = THREE.MathUtils.degToRad(30);
    const aspect = 1;
    const near = 0.1;
    const far = 10;
    
    // Calculate base dimensions
    const nearHeight = 2 * Math.tan(fov / 2) * near;
    const nearWidth = nearHeight * aspect;
    const farHeight = 2 * Math.tan(fov / 2) * far;
    const farWidth = farHeight * aspect;

    // Generate vertices array
    const vertices = [];

    // Near plane corners (0-3)
    vertices.push(
        -nearWidth/2, -nearHeight/2, -near,  // bottom left
        nearWidth/2, -nearHeight/2, -near,   // bottom right
        nearWidth/2, nearHeight/2, -near,    // top right
        -nearWidth/2, nearHeight/2, -near    // top left
    );

    // Generate curved far plane vertices
    const farVerticesCount = farPlaneSegments * 2 + 2;
    const radiusX = farWidth / 2;
    const radiusY = farHeight / 2;
    const radiusZ = far * 0.25;

    // Generate curved far plane points - now from -π/2 to π/2
    for (let i = 0; i <= farPlaneSegments; i++) {
        for (let j = 0; j <= 1; j++) {
        const xProgress = i / farPlaneSegments;
        const theta = (xProgress - 0.5) * Math.PI; // Map from -π/2 to π/2
        const y = (j * 2 - 1) * farHeight/2;
        
        // Calculate curved position
        const x = radiusX * Math.sin(theta);
        // const z = -far + radiusZ * Math.cos(theta);
        const z = -far - radiusZ * (Math.cos(theta));
        
        vertices.push(x, y, z);
        }
    }

        
    // Create separate geometries for main body and far plane
    const mainIndices = [];
    const farPlaneIndices = [];
    
    // Near plane (main)
    mainIndices.push(
      0, 1, 2,
      0, 2, 3
    );
    
    // Connect near plane to curved far plane (main)
    const startFarIndex = 4;
    const midFarIndex = 4 + Math.floor(farPlaneSegments/2) * 2;
    
    mainIndices.push(
      0, startFarIndex, 1,      // bottom left
      1, midFarIndex, 2,        // bottom to top connection
      2, midFarIndex + 1, 3,    // top right
      3, startFarIndex + 1, 0   // top to bottom connection
    );
    
    // Create side faces (main)
    for (let i = 0; i < farPlaneSegments; i++) {
      const baseIndex = 4 + (i * 2);
      // Bottom face strip
      mainIndices.push(
        0, baseIndex + 2, baseIndex,
        1, baseIndex + 2, baseIndex
      );
      // Top face strip
      mainIndices.push(
        2, baseIndex + 3, baseIndex + 1,
        3, baseIndex + 3, baseIndex + 1
      );
    }
    
    // Create curved far plane faces (separate)
    for (let i = 0; i < farPlaneSegments; i++) {
      const baseIndex = 4 + (i * 2);
      farPlaneIndices.push(
        baseIndex, baseIndex + 2, baseIndex + 1,
        baseIndex + 1, baseIndex + 2, baseIndex + 3
      );
    }
    
    // Create main geometry
    const mainGeometry = new THREE.BufferGeometry();
    mainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    mainGeometry.setIndex(mainIndices);
    mainGeometry.computeVertexNormals();
    
    // Create far plane geometry
    const farPlaneGeometry = new THREE.BufferGeometry();
    farPlaneGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    farPlaneGeometry.setIndex(farPlaneIndices);
    farPlaneGeometry.computeVertexNormals();
    
    // Create materials
    const mainMaterial = new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide
    });
    
    const farPlaneMaterial = new THREE.MeshBasicMaterial({
      color: farPlaneColor,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide
    });
    
    // Create meshes
    this.mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    this.farPlaneMesh = new THREE.Mesh(farPlaneGeometry, farPlaneMaterial);
    
    // Group for easier management
    this.mesh = new THREE.Group();
    this.mesh.add(this.mainMesh);
    this.mesh.add(this.farPlaneMesh);
    
    // Add wireframe
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: opacity * 2
    });
    this.wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(mainGeometry),
      wireframeMaterial
    );
  }
  
  // Method to update the visualization when camera properties change
  update(model) {
    this.mesh.position.copy(model.position);
    this.mesh.rotation.copy(model.rotation);
    this.wireframe.position.copy(model.position);
    this.wireframe.rotation.copy(model.rotation);
  }
  
  // Add the visualization to a scene
  addToScene(scene) {
    scene.add(this.mesh);
    scene.add(this.wireframe);
  }
  
  // Remove the visualization from a scene
  removeFromScene(scene) {
    scene.remove(this.mesh);
    scene.remove(this.wireframe);
  }
}