var THREE = require('three');
import { PubSub } from '../messaging/pubSub.js';


class Peg {
  constructor(width, height, depth, x, y, z, face, scene){
    //this.scene = scene;
    this.chID;
    this.signal = 1;
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
    this.alreadyHitList = []; //this should get cleared every rotation
    this.cylinderRotation = 0;

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

    let collision = false;
    let collisionObj = null;
    let vertHitCount = 0; //number of vertices that are hit. has to be 2 for a trigger to be sent.
  	for (var vIndex = 0; vIndex < this.mesh.geometry.vertices.length; vIndex++)
  	{

  		var localVertex = this.mesh.geometry.vertices[vIndex].clone();
  		var globalVertex =  localVertex.applyMatrix4( this.mesh.matrix );
  		var directionVector = globalVertex.sub( this.mesh.position );

      //TODO move object creation outside of loop and reuse it. will be much more efficient.
  		var ray = new THREE.Raycaster( this.originPoint, directionVector.clone().normalize(), 0, directionVector.length() );

  		var intersectedObjects = ray.intersectObjects( collidables );
      if (intersectedObjects.length > 0){ //if there is atleast one collision with the ray
        //console.log(collision);
        collision = true;
        collisionObj = intersectedObjects[0].object;
        this.currentCollisionUUID = collisionObj.uuid;
        //check if its a new collision and not an existing one
        vertHitCount += 1;
      }

  	}

    if (collision == true && vertHitCount >= 2){

      this.changeColor(collisionObj); //want colour to change for the whole collision

      //check its not already hit
      this.alreadyHitList.forEach(function(each){
        if (each == collisionObj.uuid ){ //if its already been hit then set collision to false
          collision = false;
          //collisionObj.material.color.setHex(0x6fa1a1);
        }
      });

      if (collision){ //if its still a valid (new) collision event
        this.sendTrigger();

        this.alreadyHitList.push(collisionObj.uuid);
      }

    }

    if (collisionObj != null && collision == false){ //change colour back to normal
      collisionObj.material.color.setHex(0x6fa1a1);
    }
      // //check if the collision is with the same peg.
      // if (intersectedObjects[0].object.uuid != this.currentCollisionUUID){
      //   collision = true;
      //   collisionObj = intersectedObjects[0].object;
      //   this.sendTrigger();
      //   this.changeColor(collisionObj);
      //   this.currentCollisionUUID = intersectedObjects[0].object.uuid; //set current collision to new collision
      // }
  }

  resetHitList(){
    this.alreadyHitList = [];
  }

  //
  sendTrigger(){
    this.messaging.publish("collision", this.signal);
  }

  //deal with changing color when collided
  changeColor(obj){
    obj.material.color.setHex(0xdc322f);
  }


}

export {Peg};
