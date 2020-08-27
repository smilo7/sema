var THREE = require('three');


class NudgeButton{
  constructor(scene, x, y, z, height){
    var textureLoader = new THREE.TextureLoader();
    this.spriteMap = textureLoader.load('images/ball.png');

    // this.spriteMap = new THREE.TextureLoader().load( 'images/ball.png' );
    this.spriteMaterial = new THREE.SpriteMaterial( { map: this.spriteMap, color:'#69f' } );
    this.sprite = new THREE.Sprite( this.spriteMaterial );
    this.scene = scene;
    //this.sprite = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
    this.sprite.position.set(x, y+(height*1.5), z);
    //this.sprite.scale.set( 10, 10, 10 );
    this.sprite.scale.set(10,10,1);
    this.sprite.center = new THREE.Vector2(1, 0.5);
    console.log(this.scene);
    this.scene.add( this.sprite );
  }
}

export { NudgeButton };
