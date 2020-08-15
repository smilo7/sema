var THREE = require('three');

class Peg {
  constructor(width, height, depth, x, y, z, face, scene){
    //this.scene = scene;
    this.chID;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
    this.material = new THREE.MeshLambertMaterial( {color: 0x6fa1a1} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.face = face;
    this.code = '';
    this.scene = scene;

    //add to scene
    //this.scene.add( this.mesh );
    //set position

    //boundingBox stuff
    this.box = new THREE.Box3();
    this.mesh.geometry.computeBoundingBox();

  }

  setPos(){
    this.mesh.position.set(this.x,this.y,this.z)
    //this.mesh.lookAt(this.rotateToFace); //rotates peg to look in direction of face
    //console.log("face rotation!", this.rotateToFace);
  }

  getMesh(){
    return this.mesh;
  }

  rotateToFace(){
    let normal = this.face.normal.applyMatrix4(this.mesh.parent.matrix);
    normal = normal.applyMatrix4(this.mesh.matrix);
    this.mesh.lookAt(normal);
    this.mesh.rotate.x(0.5)
  }

  boundingBox(){


    //this.box.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
    //this.box.setFromObject(this.mesh);
    var boundingBox = new THREE.Box3();

    boundingBox.copy( this.mesh.geometry.boundingBox );

    this.mesh.parent.updateMatrixWorld( true );
    this.mesh.updateMatrixWorld( true );
    boundingBox.applyMatrix4(this.mesh.matrixWorld);


    var box = new THREE.BoxHelper( this.mesh, 0xffff00 );
    this.scene.add( box );
  }

  collision(collidables){
      // collision detection:
  	//   determines if any of the rays from the cube's origin to each vertex
  	//		intersects any face of a mesh in the array of target meshes
  	//   for increased collision accuracy, add more vertices to the cube;
  	//		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  	//   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    var collision = false;

  	var originPoint = this.mesh.getWorldPosition().clone();

    //make raycaster for each vertex
    //var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );

    //for each vertex546bn
  	for (var vertexIndex = 0; vertexIndex < this.mesh.geometry.vertices.length; vertexIndex++)
  	{
  		var localVertex = this.mesh.geometry.vertices[vertexIndex].clone();
  		var globalVertex = localVertex.applyMatrix4( this.mesh.matrix );
  		var directionVector = globalVertex.sub( this.mesh.position );

  		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize(), 0, directionVector.length() );
      //this.mesh.parent.add(new THREE.ArrowHelper(ray.direction, originPoint, directionVector.length()));
      //this.mesh.parent.add(new THREE.ArrowHelper(directionVector.clone().normalize(), originPoint, 10, 0xff0000) );
      //var ray = new THREE.Raycaster(originPoint, localVertex);
  		var intersectedObjects = ray.intersectObjects( collidables );
      if (intersectedObjects.length > 0){
        console.log(intersectedObjects.length);
        console.log(intersectedObjects[0].object.geometry.type);
        intersectedObjects[0].object.material.color.setHex(0xFF0000);
        //intersectedObjects[0].object.material.color.setHex(0xFF0000);
      }
      //&& intersectedObjects[0].object.geometry.type == 'BoxGeometry'
  		if ( intersectedObjects.length > 0 && intersectedObjects[0].distance < directionVector.length()){
        collision = true;
        console.log("COLLISION OCCURED", collision);
        intersectedObjects[0].object.material.color.setHex(0x32CD32);
      }
  	}
    return collision;
  }


}

export {Peg};
