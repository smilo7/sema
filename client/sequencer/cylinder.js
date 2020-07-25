var THREE = require('three')

class Cylinder {
  constructor (scene, x, y, z, edges=true){
    //spawn location of cylinder
    this.rotationSpeed = 0;
    this.x = x;
    this.y = y;
    this.geometry = new THREE.CylinderGeometry( 5, 5, 20, 8, 6 );
    this.material = new THREE.MeshBasicMaterial( {color: 0xcc66ff, vertexColors: THREE.VertexColors } );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(x,y,z);

    //edges
    if (edges){
      this.edges = displayWireFrame(this.geometry);
      this.edges.position.set(x,y,z);
      scene.add(this.edges);
    }
    //add to scene
    scene.add(this.mesh);
  }

}

function displayWireFrame(geometry){
    var wireframe = new THREE.WireframeGeometry( geometry );

    var line = new THREE.LineSegments( wireframe );
    //line.material.depthTest = false;
    //line.material.opacity = 0.1;
    //line.material.transparent = true;

    return line
}

export { Cylinder };
