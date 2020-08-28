var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
//import * as utils from '../sequencer/utils.js';
import {setFaceColor, getCanvasRelativePosition, setPickPosition} from '../sequencer/utils.js';

//for selecting cylinders :)
export class PickHelper {
	constructor(){
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.hoverObject = null;
		this.hoverObjectSavedColor = 0;
		this.faceIdx1 = -1, this.faceIdx2 = -1; //selected face ids
		this.hoverFace = null;
		this.hoverFaceSavedColor = new THREE.Color(0x6fa1a1);
    this.selectionColor = new THREE.Color( 0x7CFC00 );
	}

  //for changing the colour of the cylinder faces upon the mouse hovering
	hover(normalisedPosition, scene, camera){

		// restore the color if there is a hover object
	  if (this.hoverObject != null && this.hoverObject.geometry.type == 'CylinderGeometry') {
			//console.log(this.hoverObjectSavedColor);
			setFaceColor(this.faceIdx1, this.hoverFaceSavedColor, this.hoverObject);
			setFaceColor(this.faceIdx2, this.hoverFaceSavedColor, this.hoverObject);
			//this.hoverObject.material.emissive.setHex(this.hoverObjectSavedColor);
			this.hoverObject.material.color.setHex(this.hoverObjectSavedColor);
			//this.hoverObject.geometry.faces[this.faceIdx1];

	    this.hoverObject = null;
			this.faceIdx1 = -1;
			this.faceIdx2 = -1;
		}


		this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.hoverObject = intersectedObjects[0].object;
			//if its a cylinder
			if (this.hoverObject.geometry.type === 'CylinderGeometry'){
				//get and store the face indexes
				this.faceIdx1 = intersectedObjects[0].faceIndex;
				this.faceIdx2 = this.faceIdx1 % 2 === 0 ? this.faceIdx1 + 1: this.faceIdx1 - 1;
				//save face color
				this.hoverFaceSavedColor = new THREE.Color(this.hoverObject.geometry.faces[this.faceIdx1].color.getHex());

				//console.log(this.hoverObject.geometry.faces[this.faceIdx1].vertexNormals);
				//makeShape(this.hoverObject.geometry.faces[this.faceIdx1].vertexNormals);


				setFaceColor(this.faceIdx1, this.selectionColor, this.hoverObject);
				setFaceColor(this.faceIdx2, this.selectionColor, this.hoverObject);
	      // save its color
	      this.hoverObjectSavedColor = this.hoverObject.material.color.getHex();
				//this.hoverObjectSavedColor = this.hoverObject.material.emissive.getHex();
	      // set its emissive color to yellow
				//this.hoverObject.material.emissive.setHex(0x97abcc);
				this.hoverObject.material.color.setHex(0x839496);

			}
    }
	}

  //placing pegs
  place(normalisedPosition, scene, camera){
    //getCanvasRelativePosition(canvas);
    this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
			//console.log("click!", intersectedObjects[0].object);
			//if its a cylinder
			if (this.pickedObject.geometry.type === 'CylinderGeometry'){
				//get and store the face indexes
				this.faceIdx1 = intersectedObjects[0].faceIndex;
				this.faceIdx2 = this.faceIdx1 % 2 === 0 ? this.faceIdx1 + 1: this.faceIdx1 - 1;
        console.log("picked face", this.pickedObject.geometry.faces[this.faceIdx1]);
        //actual face object
        let face1 = this.pickedObject.geometry.faces[this.faceIdx1];
        let face2 = this.pickedObject.geometry.faces[this.faceIdx2];
				//console.log("face normal", face1.normal);
				console.log("face normals", face1.normal);
				console.log("face normals", face2.normal);

				//index for vertices of each face object
        let vertIndxFace1 = [face1.a, face1.b, face1.c];
        let vertIndxFace2 = [face2.a, face2.b, face2.c];


        let middleOfFace = this.calcFaceVertices(this.pickedObject, vertIndxFace1.concat(vertIndxFace2));
        //middleOfFace = this.applyMatrixTransform(this.pickedObject, middleOfFace);
				//let faceNormal = this.calcFaceNormal(face1, this.pickedObject, middleOfFace);
				//let faceNormal = this.rotateToFace(this.pickedObject, face1.normal);
        return [this.pickedObject.geometry.uuid, middleOfFace, face1];
        //return {uuid:this.pickedObject.geometry.uuid, v1:vertIndxFace1, v2:vertIndxFace2};
			}
    }
  }

	nudgeButtonClick(normalisedPosition, objects, camera){
		this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(objects);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
			if (this.pickedObject.type == "Sprite"){
				console.log(this.pickedObject);
				return this.pickedObject.uuid;
			}
		}
		return undefined;
	}

	//return UUID  of peg if right clicked
	rightClickMenu(normalisedPosition, objects, camera){
		this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(objects);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
			console.log(this.pickedObject);
			return this.pickedObject.uuid;
		}
		return undefined;
	}


	//hover cylinder rollover
	placeCylinder(normalisedPosition, objects, camera, rolloverCylinder){
		this.raycaster.setFromCamera(normalisedPosition, camera);
		const intersectedObjects = this.raycaster.intersectObjects([objects]);
    if (intersectedObjects.length > 0) {
			this.pickedObject = intersectedObjects[0].object;
			let intersect = intersectedObjects[0];
			//console.log(this.pickedObject);
				rolloverCylinder.position.copy( intersect.point ).add( intersect.face.normal );
				rolloverCylinder.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 5 );
				rolloverCylinder.position.y += -5;
		}

	}

	//handling right clicking on plane
	createCylinder(normalisedPosition, object, scene, camera){
		this.raycaster.setFromCamera(normalisedPosition, camera);
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);
		console.log(intersectedObjects);
    if (intersectedObjects.length > 0) {
			console.log(intersectedObjects[1].object.geometry);
			console.log(intersectedObjects[1].object.uuid, object.uuid)
			if (intersectedObjects[1].object.uuid === object.uuid){
				console.log("ASDJHKASD");
				return true;
			}
		}
		return false;
	}

	//calculates the center of the selected face (faces as there are two triangles)
	//vertices are stored in the object
	//arr contains index of face vertex locations in obj.geometry.vertices
  calcFaceVertices(obj, arr){
    let sum = new THREE.Vector3(0,0,0);
    //let divider = new THREE.Vector3(arr.length,arr.length,arr.length);
    arr.forEach(function (item, index){
      let each = obj.geometry.vertices[item];
      sum.add(each);
    });
		return sum.divideScalar(arr.length);
    //return sum.divide(divider);
  }

	//apply matrix transform so that the coords are relative to the world
	//position of the faces
  applyMatrixTransform(obj, vector){
    return vector.applyMatrix4(obj.matrix);
  }

	rotateToFace(obj, normal){
		return normal.applyMatrix4(obj.matrix)
	}

	//calculate how much peg should be rotated. so that it is inline with the
	//clicked face
	//just need to pass in one face as they have the same normal
	calcFaceNormal(face, obj, _v1){
		let vToLookAt; //vector for peg to lookAt
		let _normalMatrix = new THREE.Matrix3();
		let _v2 = new THREE.Vector3();
		let normal = face.normal.clone();

		_normalMatrix.getNormalMatrix( obj.matrixWorld );

		console.log(_normalMatrix);
		_v2.copy(normal).applyMatrix3( _normalMatrix ).normalize() //.multiplyScalar(10).add( _v1 );
		console.log("v2", _v2);

		vToLookAt = _v2;
		return vToLookAt;
	}



}
