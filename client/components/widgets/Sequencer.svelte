<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  import { PubSub } from '../../messaging/pubSub.js';
  import * as THREE from '../../sequencer/three.js';
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

	function init()
	{
			//let drawContext = canvas.getContext('webgl');
			//let drawContext = document.querySelector("#glCanvas");
			renderer = new THREE.WebGLRenderer( { canvas: canvas } );
	    //var width = window.innerWidth;
	    //var height = window.innerHeight;

			var width = canvas.offsetWidth;
			var height = canvas.offsetHeight;
	    renderer.setSize (width, height);
	    //document.body.appendChild (renderer.domElement);

	    scene = new THREE.Scene();

	    makeCylinder();
	    setCamera(width, height);
	    //makeSomething();
	    cubeCylinder();


	    //controls = new THREE.OrbitControls (camera, renderer.domElement);

	    var gridXZ = new THREE.GridHelper(100, 10);
	    gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
	    scene.add(gridXZ);

	    //raycaster
	    let raycaster = new THREE.Raycaster();
	    let mouse = new THREE.Vector2();


	}

	function makeSomething(){
	    var geom = new THREE.Geometry();
	    var v1 = new THREE.Vector3(0,0,0);
	    var v2 = new THREE.Vector3(0,500,0);
	    var v3 = new THREE.Vector3(0,500,500);

	    geom.vertices.push(v1);
	    geom.vertices.push(v2);
	    geom.vertices.push(v3);

	    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

	    var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
	    scene.add(object);
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

	function cubeCylinder(){
	    for(var i = 0; i < 20; i++) {
	        var geometry = new THREE.BoxGeometry( 5, 5, 5 );
	        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	        var cube = new THREE.Mesh( geometry, material );

	        let angle = (i / (10/2)) * Math.PI;
	        cube .position.x = (50 * Math.cos(angle));
	        cube .position.z = (50 * Math.sin(angle));
	        cube .position.y = 5;
	        scene.add(cube);
	    }
	}

	function makeCylinder(){
	    //CYLINDER
	    var cylinderGeometry = new THREE.CylinderGeometry( 5, 5, 20, 8, 6 );
	    var cylinderMaterial = new THREE.MeshBasicMaterial( {color: 0xcc66ff} );

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


	function animate()
	{
	    //controls.update();
	    requestAnimationFrame ( animate );
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
