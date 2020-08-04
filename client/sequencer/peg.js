var THREE = require('three');

class Peg {
  constructor(width, height, depth, x, y, z, face){
    //this.scene = scene;
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

    //add to scene
    //this.scene.add( this.mesh );
    //set position

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


  collision(){
      // collision detection:
  	//   determines if any of the rays from the cube's origin to each vertex
  	//		intersects any face of a mesh in the array of target meshes
  	//   for increased collision accuracy, add more vertices to the cube;
  	//		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  	//   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    let collision = false;

  	var originPoint = this.mesh.position.clone();

  	for (var vertexIndex = 0; vertexIndex < this.mesh.geometry.vertices.length; vertexIndex++)
  	{
  		var localVertex = this.mesh.geometry.vertices[vertexIndex].clone();
  		var globalVertex = localVertex.applyMatrix4( this.mesh.matrix );
  		var directionVector = globalVertex.sub( this.mesh.position );

  		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
  		var collisionResults = ray.intersectObjects( collidableMeshList );
  		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
  			collision = true
  	}
    console.log("collision occured")
    return collision;
  }


}

export {Peg};
