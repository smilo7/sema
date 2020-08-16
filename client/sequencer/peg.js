var THREE = require('three');
import { PubSub } from '../messaging/pubSub.js';

class Peg {
  constructor(width, height, depth, x, y, z, face, scene){
    //this.scene = scene;
    this.chID;
    this.signal = 30;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
    this.material = new THREE.MeshLambertMaterial( {color: 0x6fa1a1} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.face = face;
    this.code = '';
    this.scene = scene;
    this.currentCollisionUUID = null;

    //add to scene
    //this.scene.add( this.mesh );
    //set position

    //boundingBox stuff
    this.box = new THREE.Box3();
    this.mesh.geometry.computeBoundingBox();
    this.messaging = new PubSub();


    //objects for collision so they dont get recreated all the time
    this.originPoint = new THREE.Vector3(0,0,0);
  }

  setPos(){
    this.mesh.position.set(this.x,this.y,this.z)
    //this.mesh.lookAt(this.rotateToFace); //rotates peg to look in direction of face
    //console.log("face rotation!", this.rotateToFace);
  }

  getMesh(){
    return this.mesh;
  }

  rotateToFace(){
    let normal = this.face.normal.applyMatrix4(this.mesh.parent.matrix);
    normal = normal.applyMatrix4(this.mesh.matrix);
    this.mesh.lookAt(normal);
    this.mesh.rotate.x(0.5)
  }

  boundingBox(){


    //this.box.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
    //this.box.setFromObject(this.mesh);
    var boundingBox = new THREE.Box3();

    boundingBox.copy( this.mesh.geometry.boundingBox );

    this.mesh.parent.updateMatrixWorld( true );
    this.mesh.updateMatrixWorld( true );
    boundingBox.applyMatrix4(this.mesh.matrixWorld);


    var box = new THREE.BoxHelper( this.mesh, 0xffff00 );
    this.scene.add( box );
  }

  collision(collidables){

  	this.mesh.getWorldPosition(this.originPoint).clone(); //have to get world pos for it to work properly

    //for each vertex
  	for (var vertexIndex = 0; vertexIndex < this.mesh.geometry.vertices.length; vertexIndex++)
  	{

  		var localVertex = this.mesh.geometry.vertices[vertexIndex].clone();
  		var globalVertex = localVertex.applyMatrix4( this.mesh.matrix );
  		var directionVector = globalVertex.sub( this.mesh.position );
  		var ray = new THREE.Raycaster( this.originPoint, directionVector.clone().normalize(), 0, directionVector.length() );

      let collisionObj = null;

  		var intersectedObjects = ray.intersectObjects( collidables );
      if (intersectedObjects.length > 0){
        //check if its a new collision and not an existing one
        if (intersectedObjects[0].object.uuid != this.currentCollisionUUID){
          collisionObj = intersectedObjects[0].object;
          this.sendTrigger();
          this.changeColor(collisionObj);
          this.currentCollisionUUID = intersectedObjects[0].object.uuid; //set current collision to new collision
        }
      } else if(collisionObj != null){ //set collision uuid back to normal (null)
        this.currentCollisionUUID = null;
        collisionObj.material.color.setHex(0x6fa1a1);
        collision = false;
      }

  	}

  }

  //
  sendTrigger(){
    this.messaging.publish("collision", this.signal);
  }

  //deal with changing color when collided
  changeColor(obj){
    obj.material.color.setHex(0xFF0000);
  }


}

export {Peg};
