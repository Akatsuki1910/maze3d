import {
  AxesHelper,
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'

import fragmentSource from '../shader/shader.frag'
import vertexSource from '../shader/shader.vert'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const renderer = new WebGLRenderer({ canvas })
const scene = new Scene()

let w = window.innerWidth
let h = window.innerHeight

const camera = new PerspectiveCamera(60, w / h, 0.1, 4000)
camera.rotation.order = 'YXZ'
// camera.position.y = 1000
// camera.rotateX(Math.PI)

camera.position.y = 0.1
camera.rotateY(-Math.PI)

// const cont = new OrbitControls(camera, renderer.domElement)

var axes = new AxesHelper(500)
scene.add(axes)

const uniforms = {
  time: { type: 'f', value: 1.0 },
  resolution: { type: 'v2', value: new Vector2() },
}

let material = new ShaderMaterial({
  uniforms: uniforms,
  // wireframe: true,
  vertexShader: vertexSource,
  fragmentShader: fragmentSource,
  side: DoubleSide,
})

const size = 500
const geo = new PlaneGeometry(size, size)
uniforms.resolution.value.x = w
uniforms.resolution.value.y = h

// 1
//2
const mazes = [
  [1, 0, 0, 0, 2, 2],
  [1, 1, 1, 1, 0, 2],
  [2, 3, 1, 1, 0, 0],
  [2, 2, 1, 1, 1, 0],
  [1, 1, 1, 2, 1, 2],
  [0, 0, 0, 1, 0, 0],
]

const x = mazes[0].length
const y = mazes.length

function createMesh(l: number, i: number, ry = 0, rx = 0, y = 0) {
  const mesh = new Mesh(geo, material)
  scene.add(mesh)
  mesh.rotateX(Math.PI * rx)
  mesh.rotateY(Math.PI * ry)
  mesh.position.y = (size / 2) * y
  mesh.position.x = size * l
  mesh.position.z = size * i
}

mazes.forEach((maze, i) => {
  maze.forEach((m, l) => {
    createMesh(l, i, 0, 0.5, 1)

    createMesh(l, i, 0, -0.5, -1)

    switch (m) {
      case 1:
        createMesh(l + 0.5, i, 0.5)
        break
      case 2:
        createMesh(l, i + 0.5, 1)
        break
      case 3:
        createMesh(l + 0.5, i, 0.5)
        createMesh(l, i + 0.5, 1)
        break
    }

    if (l === 0) {
      createMesh(l - 0.5, i, 0.5)
    }

    if (l === x - 1) {
      createMesh(l + 0.5, i, -0.5)
    }

    if (i === 0) {
      createMesh(l, i - 0.5)
    }

    if (i === y - 1) {
      createMesh(l, i + 0.5, 1)
    }
  })
})

const gg2 = new BoxGeometry(100, 100, 100)
const mm2 = new MeshBasicMaterial({ color: 0xffff00 })
const cube2 = new Mesh(gg2, mm2)
scene.add(cube2)

let count = 0
let way = 2
let yx = [0, 0]
let gyx = [0, 0]
let moveNum = 1
let rotateState = 1 //-1
let rotateStateX = 1 //-1
let rotateStateZ = 1 //-1

function isStartGoalPosition() {
  return yx[0] === gyx[0] && yx[1] === gyx[1]
}

function createGoal() {
  while (isStartGoalPosition()) {
    gyx = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)]
  }
  cube2.position.x = gyx[1] * size
  cube2.position.z = gyx[0] * size
}
createGoal()

function isMove(way: number) {
  let isFlg = false
  switch (way) {
    case 0:
      let a = yx[0] - 1
      if (a >= 0 && (mazes[a][yx[1]] === 0 || mazes[a][yx[1]] === 1)) {
        yx[0]--
        isFlg = true
      }
      break
    case 1:
      let b = yx[1] + 1
      if (b !== x && (mazes[yx[0]][yx[1]] === 0 || mazes[yx[0]][yx[1]] === 2)) {
        yx[1]++
        isFlg = true
      }
      break
    case 2:
      let c = yx[0] + 1
      if (c !== y && (mazes[yx[0]][yx[1]] === 0 || mazes[yx[0]][yx[1]] === 1)) {
        yx[0]++
        isFlg = true
      }
      break
    case 3:
      let d = yx[1] - 1
      if (d >= 0 && (mazes[yx[0]][d] === 0 || mazes[yx[0]][d] === 2)) {
        yx[1]--
        isFlg = true
      }
      break
  }
  return isFlg
}

function moveSelect() {
  for (let i = 0; i < 4; i++) {
    const a = (way + (-1 + i) * rotateState + 4) % 4
    const b = isMove(a)
    if (b) {
      moveNum = i
      way = a
      return
    }
  }
}

function move() {
  switch (moveNum) {
    case 0:
      camera.rotation.y += (Math.PI / 2 / 60) * rotateState
      break
    case 1:
      if (way === 0) camera.position.z -= size / 60
      if (way === 1) camera.position.x += size / 60
      if (way === 2) camera.position.z += size / 60
      if (way === 3) camera.position.x -= size / 60
      break
    case 2:
      camera.rotation.y -= (Math.PI / 2 / 60) * rotateState
      break
    case 3:
      camera.rotation.y += (Math.PI / 60) * rotateState
      break
    case 4:
      camera.rotation.z += Math.PI / 60
      break
  }

  axes.position.set(camera.position.x, camera.position.y, camera.position.z)
  axes.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
}

function setSize() {
  w = window.innerWidth
  h = window.innerHeight
  uniforms.resolution.value.x = w
  uniforms.resolution.value.y = h
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

window.onresize = () => setSize()
setSize()

function animation() {
  requestAnimationFrame(animation)
  renderer.render(scene, camera)
  uniforms.time.value = count / 60
  if (count % 60 === 0) {
    if (moveNum === 1) {
      if (isStartGoalPosition()) {
        moveNum = 4
        yx[0] = gyx[0]
        yx[1] = gyx[1]
        createGoal()
        rotateStateZ *= way % 2 === 0 ? -1 : 1
        rotateStateX *= way % 2 === 1 ? -1 : 1
        rotateState = rotateStateX * rotateStateZ
      } else {
        moveSelect()
      }
    } else {
      if (moveNum === 4) {
        moveSelect()
      } else {
        moveNum = 1
      }
    }
  }
  move()
  // cont.update()
  count++
}
animation()
