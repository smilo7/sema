var THREE = require('three');
import { PubSub } from '../messaging/pubSub.js';
import {setFaceColor} from '../sequencer/utils.js';

class Peg {
  constructor(width, height, depth, x, y, z, face, scene){
    //this.scene = scene;
    this.chID = 0;
    this.signal = 1;
    this.trigger = true; //Whether to act as an audio trigger or not
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.colorOptions = this.getColorOptions();
    this.color = {normal:this.getColor(), collision:0xdc322f};
    this.geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
    this.material = new THREE.MeshLambertMaterial( {color: this.color.normal} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.face = face;
    this.scene = scene;
    this.currentCollisionUUID = null;
    this.raycaster = new THREE.Raycaster(); //raycaster for collision detection
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
    //this.raycaster = new THREE.Raycaster();
  }

  setPos(){
    this.mesh.position.set(this.x,this.y,this.z)
    //this.mesh.lookAt(this.rotateToFace); //rotates peg to look in direction of face
    //console.log("face rotation!", this.rotateToFace);
  }

  getMesh(){
    return this.mesh;
  }

  getColorOptions(){
    let options = [];
    options.push(0x6c71c4);
    options.push(0xF5CB5C);
    options.push(0xEF9CDA);
    options.push(0x95D9C3);
    options.push(0xA4F9C8);
    options.push(0xA7FFF6);
    options.push(0xF94144);
    options.push(0xF3722C);
    options.push(0xF8961E);
    options.push(0xF9844A);
    options.push(0xF9C74F);
    options.push(0x90BE6D);
    options.push(0x43AA8B);
    options.push(0x4D908E);
    options.push(0x577590);
    options.push(0x277DA1);
    return options;
  }

  getColor(){
    return this.colorOptions[this.chID];
  }

  updateColor(){
    this.material.color.setHex(this.colorOptions[this.chID]);
    //this.color.normal = this.colorOptions[this.chID];
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

    this.collisionAnimationReset(); //just incase it wasnt (edge cases like really fast collisions);

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
  		//var ray = new THREE.Raycaster( this.originPoint, directionVector.clone().normalize(), 0, directionVector.length() );
      this.raycaster.set(this.originPoint, directionVector.clone().normalize());
      this.raycaster.near = 0;
      this.raycaster.far = directionVector.length();
      var ray = this.raycaster;

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

      //this.changeColor(collisionObj); //want colour to change for the whole collision


      //check its not already hit
      this.alreadyHitList.forEach(function(each){
        if (each == collisionObj.uuid ){ //if its already been hit then set collision to false
          collision = false;
          //collisionObj.material.color.setHex(0x6fa1a1);
        }
      });

      if (collision){ //if its still a valid (new) collision event
        this.sendTrigger();
        this.collisionAnimation();
        //collisionObj.material.color.setHex(this.color.collision);
        //add to list of already hit pegs so it doesnt trigger again
        this.alreadyHitList.push(collisionObj.uuid);
        //collision = false;
      }

    }

    if (collisionObj != null && collision == false){ //change colour back to normal
      this.collisionAnimationReset();
      //collisionObj.material.color.setHex(this.colorOptions[this.chID]);
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

  collisionAnimation(){
    this.material.color.setHex(this.color.collision);
    this.mesh.scale.set(1.2, 1.2, 1.2);
  }

  collisionAnimationReset(){
    this.material.color.setHex(this.colorOptions[this.chID]); //set colour to normal
    this.mesh.scale.set(1,1,1);
  }

  resetHitList(){
    this.alreadyHitList = [];
  }

  //
  sendTrigger(){
    if (this.trigger){
      console.log("COLLISION!");
      this.messaging.publish("collision", {signal: this.signal, channel: this.chID});
    }
  }

  //deal with changing color when collided
  changeColor(obj){
    obj.material.color.setHex(0xdc322f);
  }

  getMenuSettings(){
    return {trigger:this.trigger, channel:this.chID, signal:this.signal};
  }

}

export {Peg};
