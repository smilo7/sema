var THREE = require('three');

class Peg {
  constructor(scene, width, height, depth, x, y, z, rotateToFace){
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
    this.material = new THREE.MeshLambertMaterial( {color: 0x6fa1a1} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.lookAt(rotateToFace);

    this.code = '';

    //add to scene
    this.scene.add( this.mesh );
    //set position
    this.mesh.position.set(x,y,z)
  }

  getMesh(){
    return this.mesh;
  }


}

export {Peg};
