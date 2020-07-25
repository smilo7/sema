var THREE = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
//import {ReturnCanvas} as canvasB from '../components/widgets/Sequencer.svelte';
import {PickHelper} from '../sequencer/mouseStuff.js';
//import * as utils from '../sequencer/utils.js';
import {Cylinder} from '../sequencer/cylinder.js';
import {Communicator} from '../sequencer/communicator.js';

class MainSeq {
  constructor(canvas){
    if (MainSeq.instance) return MainSeq.instance; // Singleton pattern
		MainSeq.instance = this;
    this.canvas = canvas;
    this.scene, this.renderer, this.camera;
    this.controls;
    //mouse picking stuff
    this.pickPosition = {x: 0, y: 0};
    this.pickHelper = new PickHelper();
    //this.clearPickPosition();

    //Communicator
    this.communicator =  new Communicator();
    //this.communicator.createSAB("mxy", "mouseXY", 2, this.audioWorkletNode.port)
  }

  get getCanvas(){
    return this.canvas;
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
		var cylinder = new Cylinder(this.scene, 0,10,0,true);
		var cylinder2 = new Cylinder(this.scene, 20,10,0,false);
		var cylinder2 = new Cylinder(this.scene, -30,10,-20,false);
    this.setCamera(width, height);
    makeGrid(this.scene);
    //controls = new THREE.OrbitControls (camera, renderer.domElement);
		this.controls = new OrbitControls (this.camera, this.renderer.domElement);
  }

  updateEverything(){
    this.controls.update();
		this.pickHelper.pick(this.pickPosition, this.scene, this.camera);
    this.pickHelper.place(this.pickPosition, this.scene, this.camera);
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
