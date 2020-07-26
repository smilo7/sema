var THREE = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
//import * as utils from '../sequencer/utils.js';
import {setFaceColor, getCanvasRelativePosition, setPickPosition} from '../sequencer/utils.js';

//for selecting cylinders :)
export class PickHelper {
	constructor(){
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.pickedObjectSavedColor = 0;
		this.faceIdx1 = -1, this.faceIdx2 = -1; //selected face ids
		this.pickedFace = null;
		this.pickedFaceSavedColor = 0;
    this.selectionColor = new THREE.Color( 0xff0000 );
	}

  //for changing the colour of the cylinder faces upon the mouse hovering
	pick(normalisedPosition, scene, camera){

		// restore the color if there is a picked object
	  if (this.pickedObject != null && this.pickedObject.geometry.type == 'CylinderGeometry') {
			//console.log(this.pickedObjectSavedColor);
			setFaceColor(this.faceIdx1, this.pickedObjectSavedColor, this.pickedObject);
			setFaceColor(this.faceIdx2, this.pickedObjectSavedColor , this.pickedObject);
			this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
			//this.pickedObject.geometry.faces[this.faceIdx1];

	    this.pickedObject = null;
		}


		this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
			//if its a cylinder
			if (this.pickedObject.geometry.type === 'CylinderGeometry'){
				//get and store the face indexes
				this.faceIdx1 = intersectedObjects[0].faceIndex;
				this.faceIdx2 = this.faceIdx1 % 2 === 0 ? this.faceIdx1 + 1: this.faceIdx1 - 1;
				//save face color
				this.pickedFaceSavedColor = this.pickedObject.geometry.faces[this.faceIdx1].color.getHex();

				//console.log(this.pickedObject.geometry.faces[this.faceIdx1].vertexNormals);
				//makeShape(this.pickedObject.geometry.faces[this.faceIdx1].vertexNormals);


				setFaceColor(this.faceIdx1, this.selectionColor, this.pickedObject);
				setFaceColor(this.faceIdx2, this.selectionColor, this.pickedObject);
	      // save its color
	      this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
	      // set its emissive color to yellow
				this.pickedObject.material.color.setHex(0xFFFF00);
			}
    }
	}

  //placing cylinders
  place(normalisedPosition, scene, camera){
    //getCanvasRelativePosition(canvas);
    console.log("bumba");
    this.raycaster.setFromCamera(normalisedPosition, camera)
		// get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length > 0) {
			// pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
			//if its a cylinder
			if (this.pickedObject.geometry.type === 'CylinderGeometry'){
				//get and store the face indexes
				this.faceIdx1 = intersectedObjects[0].faceIndex;
				this.faceIdx2 = this.faceIdx1 % 2 === 0 ? this.faceIdx1 + 1: this.faceIdx1 - 1;
        console.log(this.pickedObject.geometry.faces[this.faceIdx1]);

        //actual face object
        let face1 = this.pickedObject.geometry.faces[this.faceIdx1];
        let face2 = this.pickedObject.geometry.faces[this.faceIdx2];

        //return the picked object
        // let vertIndxFace1 = {verta: face1.a, vertb: face1.b, vertc: face1.c};
        // let vertIndxFace2 = {verta: face2.a, vertb: face2.b, vertc: face2.c};
        let vertIndxFace1 = [face1.a, face1.b, face1.c];
        let vertIndxFace2 = [face2.a, face2.b, face2.c];

        let middleOfFace = this.calcFaceVertices(this.pickedObject, vertIndxFace1.concat(vertIndxFace2));
        middleOfFace = this.applyMatrixTransform(this.pickedObject, middleOfFace);
        return [this.pickedObject.geometry.uuid, middleOfFace];
        //return {uuid:this.pickedObject.geometry.uuid, v1:vertIndxFace1, v2:vertIndxFace2};
			}
    }
  }

  calcFaceVertices(obj, arr){
    let sum = new THREE.Vector3(0,0,0);
    let divider = new THREE.Vector3(arr.length,arr.length,arr.length);
    //return obj.geometry.vertices[arr[1]];

    console.log("obj", obj.matrix);
    arr.forEach(function (item, index){
      let each = obj.geometry.vertices[item];
      //console.log("asd", obj.geometry.vertices[item]);
      sum.add(each);
    });
    return sum.divide(divider);

  }

  applyMatrixTransform(obj, vector){
    return vector.applyMatrix4(obj.matrix);
  }

}
