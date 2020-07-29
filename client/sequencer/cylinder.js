var THREE = require('three')
import {Peg} from '../sequencer/peg.js';

class Cylinder {
  constructor (scene, x, y, z, edges=true){
    //spawn location of cylinder
    this.scene = scene;
    this.rotationSpeed = 0;
    this.x = x;
    this.y = y;
    this.geometry = new THREE.CylinderGeometry( 5, 5, 20, 8, 6 );
    this.material = new THREE.MeshLambertMaterial( {color: 0x627aa1, vertexColors: THREE.VertexColors } );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(x,y,z);

    //edges
    if (edges){
      this.edges = displayWireFrame(this.geometry);
      this.edges.position.set(x,y,z);
      this.scene.add(this.edges);
    }
    //add to scene
    this.scene.add(this.mesh);

    this.pegs = [];

    //group for cylinder and pegs
    this.group = new THREE.Group();
    //this.group.add(this.mesh);
    //this.scene.add(this.group);
    this.mesh.add(this.group);
    console.log(this.mesh.parent);
    console.log(this.group.parent);
    console.log("matrixworld", this.group.matrixWorld);
  }

  get uuid(){
    return this.geometry.uuid;
  }

  addPeg(x, y, z, rotateToFace){
    this.pegs.push(new Peg(this.scene, 3,3,10, x,y,z,rotateToFace));
    //this.mesh.attach(this.pegs[this.pegs.length-1]);
    console.log("pegMesh", this.pegs[this.pegs.length-1].getMesh());
    this.group.add(this.pegs[this.pegs.length-1].getMesh());
    this.scene.add(this.group);
    console.log(this.group);
  }
  
  rotate(rad){
    this.mesh.rotation.y += rad;
    this.group.rotation.y += rad;
    //this.mesh.rotateY(rad);
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
