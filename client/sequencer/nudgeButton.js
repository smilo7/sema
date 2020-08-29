var THREE = require('three');
import {PickHelper} from '../sequencer/mouseStuff.js';

class NudgeButton{
  constructor(scene, x, y, z, height, direction){
    this.value = 1;
    this.direction = direction;
    this.spriteMaps = this.loadSpriteMaps();
    this.setSpriteMapForDirection();

    this.spriteMaterial = new THREE.SpriteMaterial( { map: this.setSpriteMapForDirection() } );
    this.sprite = new THREE.Sprite( this.spriteMaterial );
    this.scene = scene;
    //this.sprite = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
    this.sprite.position.set(x, y+(y+2), z);
    //this.sprite.scale.set( 10, 10, 10 );
    this.sprite.scale.set(5,4,1);
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

  loadSpriteMaps(){
    var textureLoader = new THREE.TextureLoader();
    return {
      leftSingle: textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/chevron-circle-left%20single.png'),
      leftDouble: textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/chevron-circle-left%20double.png'),
      rightSingle: textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/chevron-circle-right%20single.png'),
      rightDouble:textureLoader.load('https://raw.githubusercontent.com/smilo7/sema/master/client/sequencer/images/chevron-circle-right%20double.png')
    }
  }

  setSpriteMapForDirection(){
    var textureLoader = new THREE.TextureLoader();
    if (this.direction == 'left'){
      return this.spriteMaps.leftSingle;
    } else {
      return this.spriteMaps.rightSingle;
    }
  }

  hide(){
    this.sprite.visible = false;
  }

  show(){
    this.sprite.visible = true;
  }

  switchIconDoubleArrow(){
    if (this.direction == 'left'){
      this.sprite.material = new THREE.SpriteMaterial( { map: this.spriteMaps.leftDouble } );
    } else {
      this.sprite.material = new THREE.SpriteMaterial( { map: this.spriteMaps.rightDouble } );
    }
  }

  switchIconSingleArrow(){
    if (this.direction == 'left'){

      this.sprite.material = new THREE.SpriteMaterial( { map: this.spriteMaps.leftSingle } );
    } else {
      this.sprite.material =new THREE.SpriteMaterial( { map: this.spriteMaps.rightSingle } );
    }
  }

}

export { NudgeButton };
