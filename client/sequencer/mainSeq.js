var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat.gui');
import {PickHelper} from '../sequencer/mouseStuff.js';
import {Cylinder} from '../sequencer/cylinder.js';
import {Communicator} from '../sequencer/communicator.js';
import {getCanvasRelativePosition, setPickPosition} from '../sequencer/utils.js';
import {KeyboardControls} from '../sequencer/keyboardControls.js';
import { PubSub } from '../messaging/pubSub.js';

//var Stats = require('stats.js');

class MainSeq {
  constructor(){
    //if (MainSeq.instance) return MainSeq.instance; // Singleton pattern
		//MainSeq.instance = this;
    this.playing = false;
    this.canvas;
    this.scene, this.renderer, this.camera;
    this.controls;
    //mouse picking stuff
    this.pickPosition = {x: 0, y: 0};
    this.pickHelper = new PickHelper();
    //this.clearPickPosition();

    //musical cylinder objects
    this.cylinders = [];
    this.collidables = this.getCollidables();

    //Communicator
    this.communicator =  new Communicator();

    //clock
    this.clock = new THREE.Clock();
    this.time;
    this.delta = 0;
    this.frames = 0;
    this.dcount = 0;
    this.collisionEvent = {bool: false, channel:0}; //channel to reset

    //this.communicator.createSAB("collision", "collisionTrigger", 1, this.audioWorkletNode.port)


    this.messaging = new PubSub();
    //recive messages from each peg when a collision happens
    this.messaging.subscribe("collision", e=> {
      //console.log("e HERe", e, e.signal, e.channel);
      this.communicator.send(e.signal, e.channel);
      this.collisionEvent.bool = true; //set to true so audioEngineResetter then resets after two frames
      this.collisionEvent.channel = e.channel;
    });

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
		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true} );
    var width = this.canvas.offsetWidth;
		var height = this.canvas.offsetHeight;
    this.renderer.setSize (width, height);
    this.scene = new THREE.Scene();

		this.testCylinders();

    this.setCamera(width, height);
    this.lights();
    makeGrid(this.scene);
		this.controls = new OrbitControls (this.camera, this.renderer.domElement);

    //listeners
    this.renderer.domElement.addEventListener("mousedown", e => {
      if (e.button == 0){
        this.leftClick();
      }
    });

    //right click menu
    this.renderer.domElement.addEventListener("mouseup", e => {
      //if its right click
      if (e.button == 2){
        this.rightClick();
      }
    });

    closePegMenu.addEventListener("click", function(){
    	//intersect.material.color.setHex(Math.random() * 0x777777 + 0x777777);
      pegMenu.style.display = "none";
    }, false);

    // this.renderer.domElement.addEventListener("mouseup", e => {
    //   this.communicator.send();
    // });

    console.log(this.canvas);
  }

  testCylinders(){
    var cylinder = new Cylinder(this.scene, 0,10,0,false);
		var cylinder2 = new Cylinder(this.scene, 25,10,0,false);
		var cylinder3 = new Cylinder(this.scene, -25,10,0,false);
    this.cylinders.push(cylinder, cylinder2, cylinder3); //add to store
  }

  playPause(){
    if (this.playing){
      this.playing = false
      console.log("sequencer is now paused");
    } else {
      this.playing = true;
      console.log("sequencer is now playing");
    }
  }

  //FOR PLACING PEGS
  leftClick(){
    let raycastReturn = this.pickHelper.place(this.pickPosition, this.scene, this.camera);
    let selectedUUID = raycastReturn[0];
    let middleOfSelectedFace = raycastReturn[1]; //coords to spawn the peg at
    let rotateToFace = raycastReturn[2];
    //loop through list of cylinders
    //TODO replace this with a dict so its faster
    for (let i=0;i<this.cylinders.length;i++){
      if (selectedUUID === this.cylinders[i].uuid){
        let selectedCylinder = this.cylinders[i];
        console.log("clicked", this.cylinders[i].uuid);
        console.log(middleOfSelectedFace);
        selectedCylinder.addPeg(middleOfSelectedFace.x, middleOfSelectedFace.y, middleOfSelectedFace.z, rotateToFace);
        //update list of getCollidables
        this.collidables = this.getCollidables();
        console.log(this.collidables);
      }
    }
  }

  rightClick(){
    let uuid = this.pickHelper.rightClickMenuPegs(this.pickPosition, this.collidables, this.camera);
    let pos = this.pickPosition;
    let rect = this.renderer.domElement.getBoundingClientRect();
    if (uuid !== undefined){
      //loop through cylinders and each child
      this.cylinders.forEach(function(cylinder){

        let peg = cylinder.getPeg(uuid);

        pegMenu.style.left = (pos.x) + "px";
        pegMenu.style.top = (pos.y) + "px";
        pegMenu.style.display = "";

        let settings = peg.getMenuSettings();
        console.log(settings);
        //load values from peg
        lname.checked = settings.trigger;

      });
    } else{
      console.log("couldnt find peg");
    }
  }


  updateEverything(){
    //update clock stuff
    // this.time = this.clock.getElapsedTime();
    // this.delta = this.clock.getDelta();
    let delta = this.clock.getDelta();
    this.audioEngineResetter(delta);
    this.collisionCheck(); //check for peg collisions

    //this.communicator.reset();
    this.controls.update();
		this.pickHelper.pick(this.pickPosition, this.scene, this.camera); //mouse for hovering
    this.rotateAll(delta);
    this.renderer.render(this.scene, this.camera);


    //console.log(this.delta);
  }

  audioEngineResetter(delta){
    //if collision signal recived (pubSub)
    //count two frames
    //send reset
    //reset counter to 0

    //WARNING this system means you can only have about 30 beats a second
    //stops very dense polyrythms from getting made, but should be okay for now

    let deltaCount = 0;
    //console.log(this.collisionEvent);
    if (this.collisionEvent.bool == true){
      deltaCount += delta;
      //console.log(deltaCount);
      if (deltaCount >= 0.016){
        deltaCount = 0;
        this.communicator.reset(this.collisionEvent.channel); //send 0 to audioEngine

        this.collisionEvent.bool = false; //finish collision event
        this.collisionEvent.channel = 0;
      }
    }
  }

  //for each cylinders pegs, get their mesh and add it to list; collidables
  getCollidables(){
    let collidables = [];
    this.cylinders.forEach(function(each){

      if (each.mesh.children.length > 0){
        each.mesh.children.forEach(function(peg){
          collidables.push(peg);
        });
      }
    });

    return collidables
  }

  collisionCheck(){
    let collidables = this.collidables;
    if (this.playing){
      this.cylinders.forEach(function(each){
        //console.log(collidables);
        each.checkForCollisions(collidables);
      });
    }
  }

  calcFPS(delta){
    this.frames += 1;
    this.dcount += delta;
    console.log(this.frames, this.dcount);
    if (this.dcount >= 1){
      console.log(this.frames);
      this.frames = 0;
      this.dcount = 0;
    }
  }

  rotateAll(delta){
    //console.log(this.delta);
    if (this.playing){
      this.cylinders.forEach(function(each,i){
        each.rotate(delta);
      });
    }
  }

  lights(){
    //lighthing
    var ambientLight = new THREE.AmbientLight( 0x404040 );
    this.scene.add(ambientLight);
    this.scene.background = new THREE.Color( 0xeee8d5 );
    var spotLight = new THREE.PointLight(0xffffff, 1, 1000);
    spotLight.position.set(0, 50, 100);
    var otherSide = new THREE.PointLight(0xffffff, 1, 1000);
    otherSide.position.set(0, 50, -100);
    this.scene.add(otherSide);
    // lights
		this.scene.add( new THREE.AmbientLight( 0x666666 ) );
		var light = new THREE.DirectionalLight( 0xdfebff, 1 );
		light.position.set( 50, 200, 100 );
		light.position.multiplyScalar( 1.3 );
		light.castShadow = true;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		var d = 300;
		light.shadow.camera.left = - d;
		light.shadow.camera.right = d;
		light.shadow.camera.top = d;
		light.shadow.camera.bottom = - d;
		light.shadow.camera.far = 1000;
		this.scene.add( light );
  }

  menus(){
    let menuOptions = {
      message: ''
    }
    //let gui = new dat.GUI({autoplace: false});
    let gui = new dat.GUI();
    this.canvas.appendChild(gui.domElement);
    let menu = gui.addFolder('Peg');
    menu.add(menuOptions, "message");
  }

  // statsBox(){
  //   let statz = new Stats.Stats();
  // 	statz.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  //   this.canvas.appendChild(gui.domElement);
  // }

  //had to be moved to svelte file due to some event listeners not working
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
	let gridXZ = new THREE.GridHelper(100, 10, new THREE.Color(0x586e75), new THREE.Color(0x073642));
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
