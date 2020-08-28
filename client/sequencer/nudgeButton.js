var THREE = require('three');
import {PickHelper} from '../sequencer/mouseStuff.js';

class NudgeButton{
  constructor(scene, x, y, z, height, direction){
    this.value = 1;
    this.direction = direction;
    this.spriteMap;
    this.setSpriteMapForDirection();
    this.spriteMaterial = new THREE.SpriteMaterial( { map: this.spriteMap } );
    this.sprite = new THREE.Sprite( this.spriteMaterial );
    this.scene = scene;
    //this.sprite = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
    this.sprite.position.set(x, y+(y+2), z);
    //this.sprite.scale.set( 10, 10, 10 );
    this.sprite.scale.set(5,5,1);
    this.sprite.center = new THREE.Vector2(this.setCenterForDirection(), 0.5);
    this.scene.add( this.sprite );

    this.pickHelper = new PickHelper();
  }

  setCenterForDirection(){
    if (this.direction == 'left'){
      return 1;
    } else{
      return 0;
    }
  }

  setSpriteMapForDirection(){
    var textureLoader = new THREE.TextureLoader();
    if (this.direction == 'left'){
      this.spriteMap = textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/arrow.png');
    } else {
      this.spriteMap = textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/arrow_right.png');
    }
  }

  hide(){
    this.sprite.visible = false;
  }

  show(){
    this.sprite.visible = true;
  }

}

export { NudgeButton };
