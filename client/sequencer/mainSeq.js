var THREE = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
//import {ReturnCanvas} as canvasB from '../components/widgets/Sequencer.svelte';
import {PickHelper} from '../sequencer/mouseStuff.js';
//import * as utils from '../sequencer/utils.js';
import {Cylinder} from '../sequencer/cylinder.js';
import {Communicator} from '../sequencer/communicator.js';
import {getCanvasRelativePosition, setPickPosition} from '../sequencer/utils.js';
import {KeyboardControls} from '../sequencer/keyboardControls.js';

class MainSeq {
  constructor(){
    //if (MainSeq.instance) return MainSeq.instance; // Singleton pattern
		//MainSeq.instance = this;
    this.canvas;
    this.scene, this.renderer, this.camera;
    this.controls;
    //mouse picking stuff
    this.pickPosition = {x: 0, y: 0};
    this.pickHelper = new PickHelper();
    //this.clearPickPosition();

    //musical objects
    this.cylinders = [];

    //Communicator
    this.communicator =  new Communicator();
    //this.communicator.createSAB("collision", "collisionTrigger", 1, this.audioWorkletNode.port)
  }

  get getCanvas(){
    return this.canvas;
  }

  set setCanvass(canvas){
    this.canvas = canvas;
  }


  //give the sequencer a canvas to draw to
  setCanvas(canvas){
    this.canvas = canvas;
    //console.log(canvas);
  }

  setCamera(width, height){
    this.camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
    this.camera.position.y = 160;
    this.camera.position.z = 200;
    this.camera.lookAt (new THREE.Vector3(0,0,0));
  }

  init() {
		//let drawContext = canvas.getContext('webgl');
		//let drawContext = document.querySelector("#glCanvas");
		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true} );
    //var width = window.innerWidth;
    //var height = window.innerHeight;
		var width = this.canvas.offsetWidth;
		var height = this.canvas.offsetHeight;
    this.renderer.setSize (width, height);
    //document.body.appendChild (renderer.domElement);
    this.scene = new THREE.Scene();
		var cylinder = new Cylinder(this.scene, 0,10,0,false);
		var cylinder2 = new Cylinder(this.scene, 20,10,0,false);
		var cylinder3 = new Cylinder(this.scene, -30,10,-20,true);

    this.cylinders.push(cylinder, cylinder2, cylinder3); //add to store

    this.setCamera(width, height);
    makeGrid(this.scene);
    //controls = new THREE.OrbitControls (camera, renderer.domElement);
		this.controls = new OrbitControls (this.camera, this.renderer.domElement);
    this.keyboardControls = new KeyboardControls(this.renderer.domElement);
    //listeners
    //this.renderer.domElement.addEventListener("mouseup", this.onMouseUp(this.canvas), false);
    this.renderer.domElement.addEventListener("mousedown", e => {
      //this.onMouseDown(e.clientX, e.clientY, this.scene);
      this.onMouseDown();
    });

    console.log(this.canvas);
  }

  onMouseDown(){
    // console.log("here we go", x, y);
    // console.log("blah", this.pickPosition);
    // console.log(this.scene, scene);
    let raycastReturn = this.pickHelper.place(this.pickPosition, this.scene, this.camera);
    let selectedUUID = raycastReturn[0];
    let middleOfSelectedFace = raycastReturn[1];
    //loop through list of cylinders
    //TODO replace this with a dict so its faster
    for (let i=0;i<this.cylinders.length;i++){
      //console.log("selected",selectedUUID);
      //console.log("all",this.cylinders[i].uuid);
      if (selectedUUID === this.cylinders[i].uuid){
        let selectedCylinder = this.cylinders[i];
        console.log("clicked", this.cylinders[i].uuid);

        console.log(middleOfSelectedFace);

        //selectedCylinder.geometry.vertices[raycastReturn[1]]

        selectedCylinder.addPeg(middleOfSelectedFace.x, middleOfSelectedFace.y, middleOfSelectedFace.z);
      }
    }
    //var asdasd = new Cylinder(scene, 10,10,20,false);
  }


  onMouseUp(canvas){
    console.log(this.canvas);
    //var self = this;
    console.log(canvas);
    console.log("mouseup");
    //console.log(this.getCanvas());

    //console.log(temp);
    let pos = setPickPosition(this.canvas, this.pickPosition);
    this.pickHelper.place(pos, this.scene, this.camera);
  }



  updateEverything(){
    this.controls.update();
		this.pickHelper.pick(this.pickPosition, this.scene, this.camera);
    //this.pickHelper.place(this.pickPosition, this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
  }
  // animate() {
  //   requestAnimationFrame ( this.animate );
	// 	this.controls.update();
	// 	this.pickHelper.pick(this.pickPosition, this.scene, this.camera);
  //   this.renderer.render(this.scene, this.camera);
  // }

  //returns x and y dict of canvas relative pos
  // getCanvasRelativePosition(event){
  //   //let canvas = this.canvas;
  //   console.log(this.canvas);
  //
  // 	const canvasRect = this.canvas.getBoundingClientRect(); //returns size of canvas relative to viewport
  // 	return {
  // 		x: (event.clientX - canvasRect.left) * canvas.width / canvasRect.width,
  // 		y: (event.clientY - canvasRect.top) * canvas.height / canvasRect.height
  // 	};
  // }
  //
  // setPickPosition(event){
  //   this.testing();
  //   //let canvas = this.canvas;
  // 	const pos = this.getCanvasRelativePosition(event);
  // 	this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
  // 	this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;
  // }
  //
  //
  //
  // clearPickPosition() {
  //   // unlike the mouse which always has a position
  //   // if the user stops touching the screen we want
  //   // to stop picking. For now we just pick a value
  //   // unlikely to pick something
  //   this.pickPosition.x = -100000;
  //   this.pickPosition.y = -100000;
  // }





}

//colors
var selectionColor = new THREE.Color( 0xff0000 );

function makeGrid(scene){
	let gridXZ = new THREE.GridHelper(100, 10, new THREE.Color(0xff0000), new THREE.Color(0xffffff));
	//gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
	scene.add(gridXZ);
}

//returns lineSegments object (this can be added to the scene)
function displayFaceEdges(geometry){
    var edges = new THREE.EdgesGeometry( geometry );
    var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    return line;
}

export {MainSeq};
