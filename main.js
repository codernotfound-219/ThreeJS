import './style.css'
import * as three from 'three';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new three.WebGL1Renderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Shapes
const box = new three.BoxGeometry(4, 4, 4);
const boxMaterial = new three.MeshBasicMaterial({color: 0x00d1c7})
const boxMesh = new three.Mesh(box, boxMaterial);
scene.add(boxMesh);

function animate() {
  requestAnimationFrame(animate);
  boxMesh.rotation.x += 0.009;
  boxMesh.rotation.y += 0.009;
  boxMesh.rotation.z += 0.009;
  renderer.render(scene, camera)
}

animate()