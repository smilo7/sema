var THREE = require('three');


class NudgeButton{
  constructor(scene, x, y, z, height, direction){
    var textureLoader = new THREE.TextureLoader();
    this.direction = direction;
    this.spriteMap;
    setSpriteMapForDirection();
    this.spriteMaterial = new THREE.SpriteMaterial( { map: this.spriteMap, color:'#69f' } );
    this.sprite = new THREE.Sprite( this.spriteMaterial );
    this.scene = scene;
    //this.sprite = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
    this.sprite.position.set(x, y+(height*1.5), z);
    //this.sprite.scale.set( 10, 10, 10 );
    this.sprite.scale.set(10,10,1);
    this.sprite.center = new THREE.Vector2(this.setCenterForDirection(), 0.5);

    console.log(this.scene);
    this.scene.add( this.sprite );
  }

  setCenterForDirection(){
    if (this.direction == 'left'){
      return 1;
    } else{
      return 0;
    }
  }

  setSpriteMapForDirection(){
    if (direction == 'left'){
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
