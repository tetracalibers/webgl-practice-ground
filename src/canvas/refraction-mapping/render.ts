import { Space } from "@/lib/canvas/index"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { Geometry } from "@/lib/webgl/geometry"
import { Program } from "@/lib/webgl/gl-program"
import { Uniforms } from "@/lib/webgl/gl-uniforms"
import { ImagesCubeTexture } from "@/lib/webgl/images-cube-texture"
import { generateCubeData } from "@/model/generator/cube"
import { MouseCoords } from "@/lib/control/mouse-coords"
import { Vector3 } from "@/lib/math/vector"
import { generateSphereData } from "@/model/generator/sphere"

import vert from "./index.vert?raw"
import frag from "./index.frag?raw"

import top from "@/assets/cube-map/sky/top.png"
import bottom from "@/assets/cube-map/sky/bottom.png"
import left from "@/assets/cube-map/sky/left.png"
import right from "@/assets/cube-map/sky/right.png"
import front from "@/assets/cube-map/sky/front.png"
import back from "@/assets/cube-map/sky/back.png"

import icosahedronModel from "@/model/json/Regular_icosahedron.json"
import { ControlUi } from "@/lib/gui/control-ui"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let program: Program
  let clock: Clock
  let mouse: MouseCoords
  let matP: Matrix4
  let matM: Matrix4
  let polyhedron: Geometry
  let sphere: Geometry
  let cube: Geometry
  let cubeMap: ImagesCubeTexture
  let count = 0
  let refractiveIdx = 0.6

  const uniforms = new Uniforms(gl, [
    "uMatView",
    "uMatModel",
    "uMatProj",
    "uEyePosition",
    "uRefraction",
    "uRefractiveIndex"
  ])

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.number("屈折率の比", refractiveIdx, 0.0, 1.0, 0.01, (v) => (refractiveIdx = v))
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    program = new Program(gl)
    program.attach(vert, frag)
    program.activate()

    matP = Matrix4.perspective(45, canvas.width / canvas.height, 0.1, 200)

    uniforms.init(program.raw)
    uniforms.fmatrix4("uMatProj", matP.values)

    mouse = new MouseCoords(canvas)
    clock = new Clock()

    space.onResize = onResize
  }

  const setupTexture = async () => {
    cubeMap = new ImagesCubeTexture(gl, { top, bottom, left, right, front, back })
    await cubeMap.setup()
  }

  const setupGeometry = () => {
    const polyhedronModel = icosahedronModel
    polyhedron = new Geometry(gl)
    // @ts-ignore
    polyhedron.registAttrib({ location: 0, components: 3, buffer: new Float32Array(polyhedronModel.vertices) })
    // @ts-ignore
    polyhedron.registAttrib({ location: 1, components: 3, buffer: new Float32Array(polyhedronModel.normals) })
    polyhedron.registIndices(new Uint16Array(polyhedronModel.indices))
    polyhedron.setup()

    const sphereModel = generateSphereData(1, 64, 64)
    sphere = new Geometry(gl)
    sphere.registAttrib({ location: 0, components: 3, buffer: new Float32Array(sphereModel.vertices) })
    sphere.registAttrib({ location: 1, components: 3, buffer: new Float32Array(sphereModel.normals) })
    sphere.registIndices(new Uint16Array(sphereModel.indices))
    sphere.setup()

    const cubeModel = generateCubeData(2.0)
    cube = new Geometry(gl)
    cube.registAttrib({ location: 0, components: 3, buffer: new Float32Array(cubeModel.vertices) })
    cube.registAttrib({ location: 1, components: 3, buffer: new Float32Array(cubeModel.normals) })
    cube.registIndices(new Uint16Array(cubeModel.indices))
    cube.setup()
  }

  const render = () => {
    count++
    const rad = ((count % 360) * Math.PI) / 180
    const rad2 = (((count + 180) % 360) * Math.PI) / 180

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const rot = mouse.quaternion()

    const eye = rot.toRotatedVector3(0, 0, 8)
    const up = rot.toRotatedVector3(0, 1, 0)
    const matV = Matrix4.view(eye, new Vector3(0, 0, 0), up)
    uniforms.fmatrix4("uMatView", matV.values)

    // 背景用キューブ
    cube.bind()
    matM = Matrix4.scaling(100, 100, 100)
    uniforms.fmatrix4("uMatModel", matM.values)
    uniforms.fvector3("uEyePosition", eye.rawValues)
    uniforms.float("uRefractiveIndex", refractiveIdx)
    uniforms.bool("uRefraction", false)
    cubeMap.activate(program.raw, "uCubeMap")
    cube.draw()

    // 球
    sphere.bind()
    matM = Matrix4.rotationZ(rad).translate(2, 0, 0)
    uniforms.fmatrix4("uMatModel", matM.values)
    uniforms.bool("uRefraction", true)
    sphere.draw()

    // 多面体
    polyhedron.bind()
    matM = Matrix4.rotationZ(rad2).translate(2, 0, 0)
    uniforms.fmatrix4("uMatModel", matM.values)
    uniforms.bool("uRefraction", true)
    polyhedron.draw()
  }

  const init = async () => {
    configure()
    setupGeometry()
    await setupTexture()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
