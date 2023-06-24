import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { Geometry } from "@/lib/webgl/geometry"
import { Program } from "@/lib/webgl/gl-program"
import { Uniforms } from "@/lib/webgl/gl-uniforms"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"
import { ControlUi } from "@/lib/gui/control-ui"

import vert from "./index.vert?raw"
import frag from "./index.frag?raw"

import rabbitModel from "@/model/json/bunny.json" assert { type: "json" }

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let program: Program
  let clock: Clock
  let camera: AngleCamera
  let matP: Matrix4
  let matM: Matrix4
  let rabbit: Geometry
  let materialColor: RawVector3 = [0.965, 0.776, 0.918]

  const uniforms = new Uniforms(gl, [
    "uMatView",
    "uMatModel",
    "uMatProj",
    "uMatNormal",
    "uLightDir",
    "uAmbient",
    "uMaterialColor"
  ])

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgb("Color", materialColor, (c) => {
      uniforms.fvector3("uMaterialColor", c)
    })
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.clearColor(0.98, 0.969, 0.941, 1.0)
    gl.clearDepth(1.0)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.enable(gl.CULL_FACE)

    program = new Program(gl)
    program.attach(vert, frag)
    program.activate()

    rabbit = new Geometry(gl)
    rabbit.registAttrib({ location: 0, components: 3, buffer: new Float32Array(rabbitModel.vertices) })
    rabbit.registAttrib({ location: 1, components: 3, buffer: new Float32Array(rabbitModel.normals) })
    rabbit.registIndices(new Uint16Array(rabbitModel.indices))
    rabbit.setup()

    camera = new AngleCamera("ORBIT")
    camera.goHome([-0.5, 0.5, 10])
    camera.azimuth = -20
    camera.elevation = -20
    camera.focus = [0, 0, 0]
    camera.update()

    matP = Matrix4.perspective(camera.fov, canvas.width / canvas.height, camera.near, camera.far)
    matM = Matrix4.identity()

    new AngleCameraController(canvas, camera)

    uniforms.init(program.get())
    uniforms.fmatrix4("uMatModel", matM.values)
    uniforms.fmatrix4("uMatProj", matP.values)
    uniforms.fmatrix4("uMatNormal", matM.inverse().values)
    uniforms.fvector3("uLightDir", [-0.5, 0.5, 200])
    uniforms.fvector3("uMaterialColor", materialColor)
    uniforms.fvector4("uAmbient", [0.2, 0.1, 0.2, 1.0])

    clock = new Clock()

    space.onResize = onResize
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const matV = camera.View
    uniforms.fmatrix4("uMatView", matV.values)

    rabbit.bind()
    rabbit.draw()
  }

  const init = () => {
    configure()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
