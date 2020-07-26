var THREE = require('three')

class Peg {
  constructor(scene, width, height, depth, x, y, z){
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
    this.material = new THREE.MeshBasicMaterial( {color: 0x43AA31} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );


    //add to scene
    this.scene.add( this.mesh );
    //set position
    this.mesh.position.set(x,y,z)
  }


}

export {Peg};
