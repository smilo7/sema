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

    this.floorPlane;
    this.rolloverCylinder;
    this.doRollover = true; //whether to activate the rollover icon

    //Communicator
    this.communicator =  new Communicator();

    //clock
    this.clock = new THREE.Clock();
    this.time;
    this.delta = 0;
    this.frames = 0;
    this.dcount = 0;
    this.collisionEvent = {bool: false, channel:0}; //channel to reset

    //current peg being edited with menu
    this.pegUsingMenu = null;
    this.cylinderUsingMenu = null;

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
    this.camera.position.y = 100;
    this.camera.position.z = 200;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
  }

  init() {
		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true} );
    var width = this.canvas.offsetWidth;
		var height = this.canvas.offsetHeight;
    this.renderer.setSize (width, height);
    this.scene = new THREE.Scene();

		//this.testCylinders();

    this.setCamera(width, height);
    this.lights();
    this.makeFloor();
    this.rolloverCylinder = this.makeRolloverCylinder();
    makeGrid(this.scene);
		this.controls = new OrbitControls (this.camera, this.renderer.domElement);

    //listener for left click
    this.renderer.domElement.addEventListener("mousedown", e => {
      if (e.button == 0){
        this.leftClick();
      }
    });

    //right click menus
    this.renderer.domElement.addEventListener("mouseup", e => {
      //if its right click
      if (e.button == 2){

        let peg = this.rightClickPeg();
        if (peg !== undefined){
          this.loadPegMenu(peg, e.clientX, e.clientY);
        }

        let cylinder = this.rightClickCylinder();
        if (cylinder !== undefined){
          this.loadCylinderMenu(cylinder, e.clientX, e.clientY);
        }

      }
    });

    //double click to place cylinder
    this.renderer.domElement.addEventListener("dblclick", e => {
      if (e.button == 0){
        if (this.pickHelper.createCylinder(this.pickPosition, this.floorPlane, this.scene, this.camera)){
          this.createCylinderMenu(e.clientX, e.clientY);
        }
      }
    });

    closeCylinderMenu.addEventListener("click", e=> {
      //save settings
      this.cylinderUsingMenu.rotationSpeed = rotationCylinderMenu.value;
      //make menu invisible
      cylinderMenu.style.display = "none";
    });

    //event handler for close pegMenu button
    closePegMenu.addEventListener("click", e=> {
      //save settings
      this.pegUsingMenu.trigger = triggerPegMenu.checked;
      this.pegUsingMenu.chID = channelPegMenu.value;
      this.pegUsingMenu.signal = signalPegMenu.value;
      //make menu invisible
      pegMenu.style.display = "none";
    });

    closeCreateCylinderMenu.addEventListener("click", e=> {
      //make menu invisible
      createCylinderMenu.style.display = "none";
      this.doRollover = true;
      this.rolloverCylinder.material.color.setHex(0xff0000);
    });

    saveCreateCylinderMenu.addEventListener("click", e=> {
      let height = heightCreateCylinderMenu.value;
      let radius = radiusCreateCylinderMenu.value;
      let segments = segmentsCreateCylinderMenu.value;

      this.constructCylinderFromMenu(height, radius, segments);
      //make menu invisible
      createCylinderMenu.style.display = "none";
      this.rolloverCylinder.material.color.setHex(0xff0000);
    });




    // this.renderer.domElement.addEventListener("mouseup", e => {
    //   this.communicator.send();
    // });

    console.log(this.canvas);
  }

  makeFloor(){
    //add plane
    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
  	geometry.rotateX( - Math.PI / 2 );
  	this.floorPlane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
  	this.scene.add( this.floorPlane );
  }

  makeRolloverCylinder(){
    let height = 0.1;
    let rollOverGeo = new THREE.BoxGeometry( 10, height, 10 );
    //let rollOverGeo = new THREE.CylinderGeometry( 5, 5, 1, 8, 6 );
		let rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
		let rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
		this.scene.add( rollOverMesh );
    return rollOverMesh;
  }

  testCylinders(){
    var cylinder = new Cylinder(this.scene, 0,20,0, 40,5,8, false);
		var cylinder2 = new Cylinder(this.scene, 25,20,0, 40,5,8,false);
		var cylinder3 = new Cylinder(this.scene, -25,20,0, 40,5,8,false);
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
        //console.log("clicked", this.cylinders[i].uuid);
        //console.log(middleOfSelectedFace);
        selectedCylinder.addPeg(middleOfSelectedFace.x, middleOfSelectedFace.y, middleOfSelectedFace.z, rotateToFace);
        //update list of getCollidables
        this.collidables = this.getCollidables();
        //console.log(this.collidables);
      }
    }
  }

  rightClickCylinder(){
    let cylinderMeshes = [];

    this.cylinders.forEach(function(each){
      cylinderMeshes.push(each.mesh);
    });

    let uuid = this.pickHelper.rightClickMenu(this.pickPosition, cylinderMeshes, this.camera);
    let cylinder = this.getCylinder(uuid);
    return cylinder;
  }

  getCylinder(uuid){
    let found = undefined;
    //find instance of cylinder with uuid
    this.cylinders.forEach(function(each){
      if (uuid === each.mesh.uuid){
        found = each;
      }
    });
    return found
  }

  loadCylinderMenu(cylinder, eventX, eventY){
    let rect = this.renderer.domElement.getBoundingClientRect();

    //pegMenu references html div
    cylinderMenu.style.left = (eventX - rect.left) + "px";
    cylinderMenu.style.top = (eventY - rect.top) + "px";
    cylinderMenu.style.display = "";

    let settings = cylinder.getMenuSettings();

    //load values from peg into menu elements
    rotationCylinderMenu.value = settings.rotationSpeed;

    this.cylinderUsingMenu = cylinder;
    console.log(this.cylinderUsingMenu);
  }

  rightClickPeg(){
    let uuid = this.pickHelper.rightClickMenu(this.pickPosition, this.getAllPegMesh(), this.camera);
    let peg = undefined;
    if (uuid !== undefined){
      //loop through cylinders and each child
      this.cylinders.forEach(function(cylinder){
        let present = cylinder.getPeg(uuid);
        if (present !== undefined){
          peg = present;
          console.log("peg here", peg);
         }
        });
    }
    return peg;
  }

  loadPegMenu(peg, eventX, eventY){
    let rect = this.renderer.domElement.getBoundingClientRect();

    //pegMenu references html div
    pegMenu.style.left = (eventX - rect.left) + "px";
    pegMenu.style.top = (eventY - rect.top) + "px";
    pegMenu.style.display = "";

    let settings = peg.getMenuSettings();
    console.log(settings);
    //load values from peg into menu elements
    triggerPegMenu.checked = settings.trigger;
    channelPegMenu.value = settings.channel;
    signalPegMenu.value = settings.signal;

    this.pegUsingMenu = peg;
    console.log(this.pegUsingMenu);
  }

  //menu for making a cylinder
  createCylinderMenu(eventX, eventY){

    //freeze the rollover, so that menu will create cylinder at correct location
    this.doRollover = false;
    this.rolloverCylinder.material.color.setHex(0x008000); //set to green

    let rect = this.renderer.domElement.getBoundingClientRect();

    //pegMenu references html div
    createCylinderMenu.style.left = (eventX - rect.left) + "px";
    createCylinderMenu.style.top = (eventY - rect.top) + "px";
    createCylinderMenu.style.display = "";
  }

  //actually create the cylinder from the menu values;
  constructCylinderFromMenu(height, radius, segments){
    //make at position of rollover;
    let x = this.rolloverCylinder.position.x;
    let y = this.rolloverCylinder.position.y + (height/2);
    let z = this.rolloverCylinder.position.z;
    this.cylinders.push(new Cylinder(this.scene, x,y,z, height, radius, segments, false));
    this.doRollover = true;
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
		this.pickHelper.hover(this.pickPosition, this.scene, this.camera); //mouse for hovering on cylinder faces

    this.rotateAll(delta);


    if (this.doRollover == true){
      this.pickHelper.placeCylinder(this.pickPosition, this.floorPlane, this.camera, this.rolloverCylinder);
    }

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
        this.communicator.reset(0);
        this.communicator.reset(1);
        this.communicator.reset(2);
        //this.communicator.reset(this.collisionEvent.channel);

        this.collisionEvent.bool = false; //finish collision event
        this.collisionEvent.channel = 0;
      }
    }
  }

  //for each cylinders pegs, get their mesh and add it to list; collidables
  getCollidables2(){
    let collidables = [];
    this.cylinders.forEach(function(cylinder, index){
      let individualList = []; //list for each cylinder
      if (cylinder.mesh.children.length > 0){ //check it has more than 0 pegs
        cylinder.mesh.children.forEach(function(peg){
          if (cylinder.getPeg(peg.uuid) === undefined){ //if its not the cylinders own peg
            individualList.push(peg);
          }
        });
      }
      collidables.push(individualList);
    });

    return collidables
  }

  //returns a nested array of collidable pegs for each cylinder.
  getCollidables(){
    let collidables = [];
    let pegsList = this.getAllPegMesh();

    this.cylinders.forEach(function(cylinder, index){
      let individualList = []; //list for each cylinder
      if (cylinder.mesh.children.length > 0){ //check it has more than 0 pegs
        pegsList.forEach(function(peg){
          if (cylinder.getPeg(peg.uuid) === undefined){ //if its not the cylinders own peg
            individualList.push(peg);
          }
        });
      }
      collidables.push(individualList);
    });
    console.log(collidables);
    return collidables;
  }

  getAllPegMesh(){
    let pegsList = [];
    this.cylinders.forEach(function(cylinder){
      pegsList.push(...cylinder.getPegList());
    });
    let meshes = []
    pegsList.forEach(function(peg){
      meshes.push(peg.mesh);
    });
    return meshes;
  }

  collisionCheck(){
    let collidables = this.collidables;
    if (this.playing){
      this.cylinders.forEach(function(each, index){
        //console.log(collidables);
        each.checkForCollisions(collidables[index]);
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
	let gridXZ = new THREE.GridHelper(1000, 100, new THREE.Color(0x586e75), new THREE.Color(0x073642));
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
