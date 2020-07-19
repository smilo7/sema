<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  import { PubSub } from '../../messaging/pubSub.js';
  //import * as THREE from '../../sequencer/three.js';
	var THREE = require('three')
	var OrbitControls = require('three-orbit-controls')(THREE)
	//import OrbitControls from '../../sequencer/controls/OrbitControls.js';
  let messaging = new PubSub();

  export let id;
  export let name;
	export let type;
  export let mode;
  export let hasFocus;
  export let background;

	export let lineNumbers;
	export let theme;
	export let data;
  // export let static; // Error: ParseError: The keyword 'static' is reserved
  export let responsive;
  export let resizable;
  export let resize;
  export let draggable;
  export let drag;
  export let min = {};
  export let max = {};
  export let x;
  export let y;
  export let w;
  export let h;
  export let component;


// declare canvas
  let canvas;
	let frame;
  let isRendering = true;

//three js stuff
	var scene, renderer, camera;
	var cube;
	var controls;

//colors
	var selectionColor = new THREE.Color( 0xff0000 );


	function init()
	{
			//let drawContext = canvas.getContext('webgl');
			//let drawContext = document.querySelector("#glCanvas");
			renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true} );
	    //var width = window.innerWidth;
	    //var height = window.innerHeight;

			var width = canvas.offsetWidth;
			var height = canvas.offsetHeight;
	    renderer.setSize (width, height);
	    //document.body.appendChild (renderer.domElement);

	    scene = new THREE.Scene();

	    //makeCylinder(5,5);
			var cylinder = new Cylinder(0,10,0,false);
	    setCamera(width, height);
	    makeGrid();
	    //cubeCylinder();

	    //controls = new THREE.OrbitControls (camera, renderer.domElement);
			controls = new OrbitControls (camera, renderer.domElement);

	}

	//for selecting cylinders :)
	class PickHelper {
		constructor(){
			this.raycaster = new THREE.Raycaster();
			this.pickedObject = null;
			this.pickedObjectSavedColor = 0;
			this.faceIdx1 = -1, this.faceIdx2 = -1; //selected face ids
		}

		pick(normalisedPosition, scene, camera){
			// restore the color if there is a picked object
		  if (this.pickedObject != null && this.pickedObject.geometry.type == 'CylinderGeometry') {
		    this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
		    this.pickedObject = null;
			}

			this.raycaster.setFromCamera(normalisedPosition, camera)
			// get the list of objects the ray intersected
	    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
	    if (intersectedObjects.length > 0) {


				// pick the first object. It's the closest one
	      this.pickedObject = intersectedObjects[0].object;
				if (this.pickedObject.geometry.type == 'CylinderGeometry'){
					this.faceIdx1 = intersectedObjects[0].faceIndex;
					this.faceIdx2 = this.faceIdx1 % 2 === 0 ? this.faceIdx1 + 1: this.faceIdx1 - 1;
					setFaceColor(this.faceIdx1, selectionColor, this.pickedObject);
					setFaceColor(this.faceIdx2, selectionColor, this.pickedObject);
		      // save its color
		      this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
		      // set its emissive color to yellow
					//this.pickedObject.material.color.setHex(0xFFFF00);
				}
	    }
		}
	}

	function setFaceColor(idx, color, obj){
	  if (idx === -1) return;
		console.log(obj.geometry.faces[idx]);
		//console.log(color)
		obj.geometry.elementsNeedUpdate = true;
		obj.geometry.colorsNeedUpdate = true;
		obj.geometry.vertexColors = true;
		console.log(obj.geometry.faces[idx].color)
	  obj.geometry.faces[idx].color.copy(color);
		obj.geometry.faces[idx].color

	}

	//returns x and y dict of canvas relative pos
	function getCanvasRelativePosition(event){
		const canvasRect = canvas.getBoundingClientRect(); //returns size of canvas relative to viewport
		return {
			x: (event.clientX - canvasRect.left) * canvas.width / canvasRect.width,
			y: (event.clientY - canvasRect.top) * canvas.height / canvasRect.height
		};
	}

	function setPickPosition(event){
		const pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x / canvas.width) * 2 - 1;
		pickPosition.y = (pos.y / canvas.height) * -2 + 1;
	}

	function clearPickPosition() {
	  // unlike the mouse which always has a position
	  // if the user stops touching the screen we want
	  // to stop picking. For now we just pick a value
	  // unlikely to pick something
	  pickPosition.x = -100000;
	  pickPosition.y = -100000;
	}

	function makeGrid(){
		let gridXZ = new THREE.GridHelper(100, 10);
		gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
		scene.add(gridXZ);
	}

	//returns lineSegments object (this can be added to the scene)
	function displayFaceEdges(geometry){
	    var edges = new THREE.EdgesGeometry( geometry );
	    var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
	    return line;
	}

	function displayWireFrame(geometry){
	    var wireframe = new THREE.WireframeGeometry( geometry );

	    var line = new THREE.LineSegments( wireframe );
	    //line.material.depthTest = false;
	    //line.material.opacity = 0.1;
	    //line.material.transparent = true;

	    return line
	}

	//utils
	function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + (max - min) * Math.random();
  }

	function randomColor() {
    return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
  }


	class Cylinder {
		constructor (x, y, z, edges=true){
			//spawn location of cylinder
			this.x = x;
			this.y = y;
			this.geometry = new THREE.CylinderGeometry( 5, 5, 20, 8, 6 );
			this.material = new THREE.MeshBasicMaterial( {color: 0xcc66ff, vertexColors: THREE.VertexColors } );
			this.mesh = new THREE.Mesh(this.geometry, this.material);
			this.mesh.position.set(x,y,z);

			//edges
			if (edges){
				this.edges = displayWireFrame(this.geometry);
		    this.edges.position.set(x,y,z);
				scene.add(this.edges);
			}

			//add to scene
			scene.add(this.mesh);
		}

	}
	function makeCylinder(x,y){
	    //CYLINDER
	    var cylinderGeometry = new THREE.CylinderGeometry( x, y, 20, 8, 6 );
	    //var cylinderMaterial = new THREE.MeshBasicMaterial( {color: 0xcc66ff} );
			var cylinderMaterial = new THREE.MeshPhongMaterial( {color: randomColor()} );
	    var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
	    cylinder.position.set(0,10,0);

	    scene.add(cylinder);

	    var edges = displayWireFrame(cylinderGeometry);
	    edges.position.set(0,10,0);
	    scene.add(edges);
	}

	function setCamera(width, height){
	    camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
	    camera.position.y = 160;
	    camera.position.z = 200;
	    camera.lookAt (new THREE.Vector3(0,0,0));
	}

	function setGrid(){

	}

	function setControls(){

	}



	//picking stuff
	const pickPosition = {x: 0, y: 0};
	const pickHelper = new PickHelper();
	clearPickPosition();

	window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
	window.addEventListener('mouseleave', clearPickPosition);
	//window.addEventListener('mouseDown', )

	function animate()
	{
	    requestAnimationFrame ( animate );
			controls.update();
			pickHelper.pick(pickPosition, scene, camera);
	    renderer.render (scene, camera);

	}




	const renderLoop = () => {

    if (isRendering) {
      frame = requestAnimationFrame(renderLoop);
      // console.log(`canvas w:${canvas.width} h:${canvas.height}`);

      let drawContext = canvas.getContext('2d');
      drawContext.canvas.width = canvas.offsetWidth;    // needed for 'automatic' resizing the canvas to current size
      drawContext.canvas.height = canvas.offsetHeight;  // TODO: Optimise by doing this only on canvas resize call
      drawContext.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
			//drawContext.fillStyle = "#FF0000";
			//drawContext.fillRect(0, 0, 150, 75);
      }
    else return;
	};

  const toggleRendering = () => {

    console.log('toggleRender')
    if(isRendering){
      cancelAnimationFrame(frame);
    }else{
      frame = requestAnimationFrame(renderLoop);
    }
    isRendering = !isRendering;

    hasFocus = true;
    console.log("clickasdasdakjshdkajshd");
    dispatch('change', {
      prop:'hasFocus',
      value: true
    });
  }

  onMount(async () => {
    // Request the creation of an WAAPI analyser to the Audio Engine
    //renderLoop();
		init();
		animate();
	});

  onDestroy(async () => {
    isRendering = false;
   	return () => cancelAnimationFrame(frame);
	})

</script>

<style>

  canvas {
    /* opacity:0.1; */
    background-color: rgb(16, 16, 16);
    height: 100%;
    width: 100%;
    /* display: block; */
    visibility: visible;
    border-radius: 2px;
    /* display: inline-block; 1 */
    vertical-align: baseline; /* 2 */
    /*left: 50%;
    margin: -200px 0 0 -200px;
    position: absolute;
    top: 50%; */
  }

</style>


<canvas bind:this={canvas}
        class="canvas"
				id="glCanvas"
				>
        </canvas>
