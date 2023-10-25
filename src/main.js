import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es'; 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
camera.position.z = 5;

const orbit = new OrbitControls( camera, renderer.domElement );
orbit.update();

//ambient light
const ambientLight = new THREE.AmbientLight();
scene.add( ambientLight );

//cannon world that will hold every cannon declaration 
const cannonWorld = new CANNON.World( {
    gravity : new CANNON.Vec3( 0, -9.81, 0 )
} );

//plane of three js

const planeGeo = new THREE.PlaneGeometry( 10, 10 );
const planeMat = new THREE.MeshBasicMaterial( {
    color : 0xFFFFFF,
    side : THREE.DoubleSide
} );
const planeMesh = new THREE.Mesh( planeGeo, planeMat );
scene.add( planeMesh );

//plane of cannon js that will hold the three's plane for physics simulation

const planePhyMat = new CANNON.Material();
const planeBody = new CANNON.Body( {
    type : CANNON.Body.STATIC,
    shape : new CANNON.Box( new CANNON.Vec3( 5, 5, 0.001 ) ),
    material : planePhyMat
} );
planeBody.quaternion.setFromEuler( -Math.PI / 2, 0, 0 );
cannonWorld.addBody( planeBody );



// variables for mouse functionaly for sphere ball's position 
const mouse = new THREE.Vector2();
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycster = new THREE.Raycaster();

// //three's mesh and cannon's body
const meshes = [];
const bodies = [];

// evet listener functionality

window.addEventListener( 'click', function( e ) {
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1 ;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    planeNormal.copy( camera.position ).normalize();
    plane.setFromNormalAndCoplanarPoint( planeNormal, scene.position );
    raycster.setFromCamera( mouse, camera );
    raycster.ray.intersectPlane( plane, intersectionPoint );

    const sphereGeo = new THREE.SphereGeometry( 0.125, 30, 30 );
	const sphereMat = new THREE.MeshStandardMaterial( {
		color : 0xFFEA00,
		metalness :0,
		roughness : 0
	} );
	const sphereMesh = new THREE.Mesh( sphereGeo, sphereMat );
	scene.add( sphereMesh );
	sphereMesh.position.copy( intersectionPoint );

    //sphereBody declared to do physics bouncing simulation logic
    const spherePhyMat = new CANNON.Material();
    const sphereBody = new CANNON.Body( {
        mass : 0.3,
        shape : new CANNON.Sphere( 0.125 ),
        position : new CANNON.Vec3( intersectionPoint.x, intersectionPoint.y, intersectionPoint.z ),
        material : spherePhyMat
    } );
    cannonWorld.addBody( sphereBody );

    const planeSphereContactMat = new CANNON.ContactMaterial(
        spherePhyMat,
        sphereBody,
        { restitution : 0.3 } 
    );
    
    cannonWorld.addContactMaterial( planeSphereContactMat );
    meshes.push(sphereMesh);
    bodies.push(sphereBody);
} );

//time step
const timeStep = 1 / 60;
function animate() {
    cannonWorld.step(timeStep);

    planeMesh.position.copy( planeBody.position );
    planeMesh.quaternion.copy( planeBody.quaternion );

    for (let i = 0; i < meshes.length; i++) {
       meshes[i].position.copy( bodies[i].position);
       meshes[i].quaternion.copy( bodies[i].quaternion );
    }

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );

animate();