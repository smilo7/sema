var THREE = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
//utils

export function setFaceColor(idx, color, obj){
  if (idx === -1) return;
	//if passed a hex value convert it to a number
	if (typeof color == "number"){
		color = new THREE.Color(color);
	}
	//console.log(obj.geometry.faces[idx]);
	//console.log(color)
	obj.geometry.elementsNeedUpdate = true;
	obj.geometry.colorsNeedUpdate = true;
	obj.geometry.vertexColors = true;
	//console.log(obj.geometry.faces[idx].color)
  obj.geometry.faces[idx].color.copy(color);
	//obj.geometry.faces[idx].color
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
