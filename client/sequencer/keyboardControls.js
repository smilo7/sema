var THREE = require('three')

class KeyboardControls {
  constructor(element){
    this.element = element;

    //call init function to make listener
    this.element.addEventListener("keydown", e => {
      //this.onMouseDown(e.clientX, e.clientY, this.scene);
      console.log(keyCode);
      this.onKeydown();
    });
  }

  init(){
    console.log(this.element);
    //this.element.addEventListener('keydown' this.onKeydown, false);
  }

  onKeydown(){
    console.log("");
  }

}

export {KeyboardControls};
