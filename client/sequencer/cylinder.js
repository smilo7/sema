var THREE = require('three')
import {Peg} from '../sequencer/peg.js';
import {FaceNormalsHelper} from '../sequencer/FaceNormalsHelper.js';

class Cylinder {
  constructor (scene, x, y, z, edges=true){
    //spawn location of cylinder
    this.scene = scene;
    this.rotationSpeed = 1;
    this.x = x;
    this.y = y;
    this.geometry = new THREE.CylinderGeometry( 5, 5, 20, 8, 6 );
    this.material = new THREE.MeshLambertMaterial( {color: 0x627aa1, vertexColors: THREE.VertexColors } );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(x,y,z);
    let helper = new FaceNormalsHelper( this.mesh, 2, 0x00ff00, 1 );
    //edges
    if (edges){
      this.edges = displayWireFrame(this.geometry);
      this.edges.position.set(x,y,z);
      this.scene.add(this.edges);
    }
    //add cylinder to scene
    this.scene.add(this.mesh);
    //this.scene.add(helper);

    this.pegs = [];

    //group for cylinder and pegs
    //this.pegGroup = new THREE.Group();
    //this.group.add(this.mesh);
    //this.scene.add(this.group);
    //this.mesh.add(this.pegGroup); //add peg group as child of cylinder mesh
    console.log(this.mesh.parent);
    //console.log("group parents", this.pegGroup.parent);
    //console.log("matrixworld", this.group.matrixWorld);
  }

  get uuid(){
    return this.geometry.uuid;
  }

  addPeg(x, y, z, face){

    this.pegs.push(new Peg(3,3,10, x*2, y, z*2, face, this.scene));
    //add peg as child of cylinder mesh
    let newPeg = this.pegs[this.pegs.length-1]
    newPeg.mesh.lookAt(face.normal);
    this.mesh.add(newPeg.getMesh());

    //this.mesh.children[this.pegs.length-1].lookAt(face.normal);
    //newPeg.mesh.updateMatrixWorld(true);
    newPeg.setPos();
    //newPeg.updateMatrix();
    //this.mesh.updateMatrix();

    //newPeg.boundingBox();

    //this.mesh.attach(this.pegs[this.pegs.length-1]);
    //console.log("pegMesh", this.pegs[this.pegs.length-1].getMesh());
    //console.log(this.pegGroup);
    //add the most recently added peg to the pegGroup
    //this.pegGroup.add(this.pegs[this.pegs.length-1].getMesh());
  }

  rotate(delta){

    this.mesh.rotation.y += 0.01 //delta * 45000 * Math.PI / 180; //this.rotationSpeed;
    //console.log(this.group.rotation);
    //this.group.rotation.y += this.rotationSpeed;
    //this.mesh.rotateY(rad);
  }



  checkForCollisions(collidables){
    //collidables is list of pegs that is attached to cylinder
    //loop through all pegs attached to cylinder
    this.pegs.forEach(function(each){
      //each.boundingBox();
      each.collision(collidables); //pass through collidables which is all the pegs.
    });
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
