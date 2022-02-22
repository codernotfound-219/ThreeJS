import './style.css'
import * as three from 'three';
import * as dat from 'dat.gui';
import {OrbitControls} from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';


// Plot
const raycaster = new three.Raycaster();
const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new three.WebGL1Renderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.setZ(100);

new OrbitControls(camera, renderer.domElement);

// GUI
const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  }
}

gui.add(world.plane, 'width', 1, 800).onChange(seaBed); // Be sure to use capital C in onChange
gui.add(world.plane, 'height', 1, 800).onChange(seaBed);
gui.add(world.plane, 'widthSegments', 12, 200).onChange(seaBed);
gui.add(world.plane, 'heightSegments', 12, 200).onChange(seaBed);

function seaBed() {
  plane.geometry.dispose()
  plane.geometry = new three.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )
  
  const { array } = plane.geometry.attributes.position;
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      
      // Vertice Position
      array[i] = x + (Math.random() - 1.5) * 3;
      array[i + 1] = y + (Math.random() - 1.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 2;
    }
    randomValues.push(Math.random() - 0.5)
  }

  // Changing the framework
  plane.geometry.attributes.position.randomValues = randomValues
  plane.geometry.attributes.position.originalPosition = plane.geometry.attributes.position.array

  // Colors
  const colors = []
  for (
    let i = 0;
    i < plane.geometry.attributes.position.count;
    i++) {
    colors.push(0, 0.19, 0.4)
  }

  plane.geometry.setAttribute(
    'color',
    new three.BufferAttribute(
      new Float32Array(colors), 3)
  )
}

// Shapes
const planeGeometry = new three.PlaneGeometry(
  world.plane.width, 
  world.plane.height,
  world.plane.widthSegments, 
  world.plane.heightSegments);
const planeMaterial = new three.MeshPhongMaterial({
  side: three.DoubleSide, 
  flatShading: three.FlatShading,
  vertexColors: true
})
const plane = new three.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -(0.3);
scene.add(plane);
seaBed()

// Lights
const light = new three.DirectionalLight(0xffffff, 1)
light.position.set(0, 1, 1);
scene.add(light);

const backLight = new three.DirectionalLight(0xffffff, 1)
backLight.position.set(0, -1, -1);
scene.add(backLight);

// Mouse constants
const mouse = {
  x: undefined,
  y: undefined,
}

// Frame
let frame = 0;

// Animation
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01
  
  // Moving the Sea
  const { array, originalPosition, randomValues } = plane.geometry.attributes.position
  for (let i = 0;
    i < array.length;
    i += 3
  ) {
    // X-axis
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.035
    // Y-axis
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.035
  }

  plane.geometry.attributes.position.needsUpdate = true

  // Raycaster
  const intersects = raycaster.intersectObject(plane);
  if (intersects.length > 0) {
    const {color} = intersects[0].object.geometry.attributes

    // Vertice 1
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)
    // Vertice 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)
    // Vertice 3
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    color.needsUpdate = true

    // GSAP
    const initalColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initalColor.r,
      g: initalColor.g,
      b: initalColor.b,
      onUpdate: () => {

        // Vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
        // Vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
        // Vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)

        color.needsUpdate = true
      }
    })

  }
}

animate()

// Events
addEventListener('mousemove', (event) => {
  mouse.x = ( event.clientX / innerWidth ) * 2 - 1 // Normalizing the cartesian system
  mouse.y = -( event.clientY / innerHeight ) * 2 + 1
})
