<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  import { PubSub } from '../../messaging/pubSub.js';

  let messaging = new PubSub();

	//import {init, animate} from '../../sequencer/mainSeq.js';
	import { MainSeq } from '../../sequencer/mainSeq.js';

	//let MainSeq = new MainSeq();
	//import * as sequencerInstance from '../../sequencer/mainSeq.js';
	//let sequencerInstance = new SequencerInstance();

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
//export canvas for mainSeq.js
  let canvas;
	let frame;
  let isRendering = true;


	const renderLoop = () => {

    if (isRendering) {
			mainSeq.setCanvas(canvas);
			mainSeq.init();
			//console.log("here", mainSeq.canvas);
			animate();

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
    console.log("click");
    dispatch('change', {
      prop:'hasFocus',
      value: true
    });
  }

	//make instance of mainSeq (sequencer main class)
	var mainSeq = new MainSeq();
	//console.log("here", canvas);
	//console.log("here", mainSeq.canvas);

	window.addEventListener('mousemove', setPickPosition, false);
	window.addEventListener('mouseout', clearPickPosition, false);
	window.addEventListener('mouseleave', clearPickPosition, false);

	document.addEventListener('keydown', e => {
		if (e.keyCode == 32){
			mainSeq.playPause();
		}
	}, false);
	window.addEventListener('mousedown', setPickPosition, false);




  onMount(async () => {
    // Request the creation of an WAAPI analyser to the Audio Engine
    //renderLoop();
		//mainSeq.getCanvas;
		//canvas.addEventListener('click', () => toggleRendering(), false);
		mainSeq.setCanvas(canvas);
		mainSeq.init();
		//console.log("here", mainSeq.canvas);
		animate();

	});

	function getCanvasRelativePosition(event){
    //let canvas = mainSeq.canvas;
    //console.log(mainSeq.canvas);

  	const canvasRect = mainSeq.canvas.getBoundingClientRect(); //returns size of canvas relative to viewport
  	return {
  		x: (event.clientX - canvasRect.left) * mainSeq.canvas.width / canvasRect.width,
  		y: (event.clientY - canvasRect.top) * mainSeq.canvas.height / canvasRect.height
  	};
  }

  function setPickPosition(event){
  	const pos = getCanvasRelativePosition(event);
  	mainSeq.pickPosition.x = (pos.x / mainSeq.canvas.width) * 2 - 1;
  	mainSeq.pickPosition.y = (pos.y / mainSeq.canvas.height) * -2 + 1;
  }



  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    mainSeq.pickPosition.x = -100000;
    mainSeq.pickPosition.y = -100000;
  }


	function animate() {

    requestAnimationFrame ( animate );
		//stats.begin();
		mainSeq.updateEverything();
		//stats.end();
		// mainSeq.controls.update();
		// mainSeq.pickHelper.pick(mainSeq.pickPosition, mainSeq.scene, mainSeq.camera);
    // mainSeq.renderer.render(mainSeq.scene, mainSeq.camera);
  }

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

	.pegMenu {
		background: #fcba03;
		overflow: hidden;
		margin: 1;
		position: relative;
		font-family: monospace;
	}

	.cylinderMenu {
		background: #fcba03;
		overflow: hidden;
		margin: 1;
		position: relative;
		font-family: monospace;
	}

</style>


<div id="pegMenu" oncontextmenu="return false;" style="position:absolute;display:none;background-color:white;font-family:monospace">
  <span color="red"><b>Peg Settings</b></span>

  <button id="closePegMenu">
    x
  </button>
	<hr>
	<label for="triggerPegMenu">Sound 🔊</label>
	<input type="checkbox" id="triggerPegMenu" name="triggerPegMenu">
	<br>
	<label for="channelPegMenu">Channel 🎚</label>
	<input type="textbox" id="channelPegMenu" name="channelPegMenu" maxlength="2" size="1">
	<label for="signalPegMenu">Signal</label>
	<input type="textbox" id="signalPegMenu" name="signalPegMenu" maxlength="3" size="3">
	<button id="savePegMenu">
		Save
	</button>
	<hr>
	<button id="deletePegMenu">
		Delete Peg
	</button>
</div>

<div id="cylinderMenu" oncontextmenu="return false;" style="position:absolute;display:none;background-color:white;font-family:monospace">
  <span color="red"><b>Cylinder Settings</b></span>
	<button id="closeCylinderMenu">
    x
  </button>
	<hr>

	<label for="rotationCylinderMenu">speed</label>
	<input type="number" id="rotationCylinderMenu" name="rotationCylinderMenu" maxlength="3" size="3">
	<button id="saveCylinderMenu">
		Save
	</button>
	<hr>
	<button id="deleteCylinderMenu">
		Delete Cylinder
	</button>
</div>

<div id="createCylinderMenu" oncontextmenu="return false;" style="position:absolute;display:none;background-color:white;font-family:monospace">
  <span color="red"><b>Create Cylinder</b></span>
	<button id="closeCreateCylinderMenu">
    x
  </button>
	<hr>
	<label for="heightCreateCylinderMenu">Height</label>
	<input type="textbox" id="heightCreateCylinderMenu" name="heightCreateCylinderMenu" maxlength="3" size="3">

	<label for="radiusCreateCylinderMenu">Radius</label>
	<input type="textbox" id="radiusCreateCylinderMenu" name="radiusCreateCylinderMenu" maxlength="3" size="3">

	<label for="segmentsCreateCylinderMenu">Segments</label>
	<input type="textbox" id="segmentsCreateCylinderMenu" name="segmentsCreateCylinderMenu" maxlength="3" size="3">
	<br>
	<button id="saveCreateCylinderMenu">
    Create
  </button>
</div>



<canvas bind:this={canvas}
        class="canvas"
				id="glCanvas"
				oncontextmenu="return false;"
				>
        </canvas>
