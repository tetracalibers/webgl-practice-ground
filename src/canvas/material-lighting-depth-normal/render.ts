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
import { generateHalfCoverPolygonData } from "@/model/generator/cover-polygon"
import { MrtRenderer } from "@/lib/webgl/mrt-renderer"

import vertCalc from "./calc.vert?raw"
import fragCalc from "./calc.frag?raw"
import vertPreview from "./preview.vert?raw"
import fragPreview from "./preview.frag?raw"

import bunny from "@/model/json/Bunny-LowPoly.json" assert { type: "json" }

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let program: Program
  let clock: Clock
  let camera: AngleCamera
  let renderer: MrtRenderer
  let matP: Matrix4
  let matM: Matrix4
  let shape: Geometry
  let plane: Geometry
  let materialColor: RawVector3 = [0.792, 0.824, 0.969]

  const planeOffset = [
    [-0.5, -0.5, 0.0],
    [-0.5, 0.5, 0.0],
    [0.5, -0.5, 0.0],
    [0.5, 0.5, 0.0]
  ]

  const uniformsShape = new Uniforms(gl, [
    "uMatView",
    "uMatModel",
    "uMatProj",
    "uMatNormal",
    "uLightDir",
    "uAmbient",
    "uMaterialColor"
  ])

  const uniformsPlane = new Uniforms(gl, ["uOffset"])

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgb("Color", materialColor, (c) => (materialColor = c))
  }

  const onResize = () => {
    space.fitScreenSquare()
    renderer.resize()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.enable(gl.CULL_FACE)

    program = new Program(gl)
    program.attach(vertPreview, fragPreview)

    renderer = new MrtRenderer(gl, canvas, vertCalc, fragCalc, { texCount: 4 })

    camera = new AngleCamera("ORBIT")
    camera.goHome([45, 30, 300])
    camera.azimuth = -5
    camera.elevation = 30
    camera.focus = [0, 0, 0]
    camera.update()

    matP = Matrix4.perspective(camera.fov, canvas.width / canvas.height, camera.near, camera.far)

    new AngleCameraController(canvas, camera)

    uniformsShape.init(renderer.program.get())
    uniformsPlane.init(program.get())

    clock = new Clock()

    space.onResize = onResize
  }

  const setupGeometry = () => {
    const model = bunny
    shape = new Geometry(gl)
    shape.registAttrib({ location: 0, components: 3, buffer: new Float32Array(model.vertices) })
    shape.registAttrib({ location: 1, components: 3, buffer: new Float32Array(model.normals) })
    shape.registIndices(new Uint16Array(model.indices))
    shape.setup()

    const planeData = generateHalfCoverPolygonData()
    plane = new Geometry(gl)
    plane.registAttrib({ location: 0, components: 3, buffer: new Float32Array(planeData.vertices) })
    plane.registAttrib({ location: 1, components: 2, buffer: new Float32Array(planeData.texCoord) })
    plane.registIndices(new Uint16Array(planeData.indices))
    plane.setup()
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    renderer.switchToOffcanvas()

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const matV = camera.View
    uniformsShape.fmatrix4("uMatView", matV.values)
    uniformsShape.fmatrix4("uMatProj", matP.values)
    uniformsShape.fvector3("uLightDir", [-0.5, 0.5, 200])
    uniformsShape.fvector3("uMaterialColor", materialColor)
    uniformsShape.fvector4("uAmbient", [0.2, 0.1, 0.2, 1.0])

    shape.bind()

    matM = Matrix4.translation(-30, 30, -500)
    uniformsShape.fmatrix4("uMatModel", matM.values)
    uniformsShape.fmatrix4("uMatNormal", matM.inverse().values)

    shape.draw({ primitive: "TRIANGLES" })

    matM = Matrix4.translation(15, 15, 0)
    uniformsShape.fmatrix4("uMatModel", matM.values)
    uniformsShape.fmatrix4("uMatNormal", matM.inverse().values)

    shape.draw({ primitive: "TRIANGLES" })

    renderer.switchToCanvas(program)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (let i = 0; i < 4; ++i) {
      uniformsPlane.fvector3("uOffset", planeOffset[i])
      renderer.useTextureOf(i, "uTexture", program.get())
      plane.bind()
      plane.draw({ primitive: "TRIANGLES" })
    }
  }

  const init = () => {
    configure()
    setupGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
