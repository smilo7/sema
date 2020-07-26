mainSeq<script>
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

	//make instance of mainSeq (sequencer main class)
	var mainSeq = new MainSeq();
	//console.log("here", canvas);
	//console.log("here", mainSeq.canvas);

	window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
	window.addEventListener('mouseleave', clearPickPosition);
	//window.addEventListener('mousedown', setPickPosition);

  onMount(async () => {
    // Request the creation of an WAAPI analyser to the Audio Engine
    //renderLoop();
		//mainSeq.getCanvas;
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
		mainSeq.updateEverything();
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

</style>


<canvas bind:this={canvas}
        class="canvas"
				id="glCanvas"
				>
        </canvas>
