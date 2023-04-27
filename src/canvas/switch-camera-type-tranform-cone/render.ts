import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { PointLight } from "@/lib/light/point-light"
import { Floor } from "@/lib/shape/floor"
import { Axis } from "@/lib/shape/axis"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import coneModel from "@/lib/model/cone3.json" assert { type: "json" }

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let camera: AngleCamera
  let transforms: Transforms
  let clock: Clock
  let light: PointLight
  let uniforms: UniformLoader<"uWireframe">

  let matModel = Matrix4.identity()

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Mode", "TRACK", ["TRACK", "ORBIT"], (mode) => {
      camera.goHome()
      camera.mode = mode
    })
    ui.xyz("Position", [0, 2, 50], -100, 100, 0.1, ({ idx, value }) => {
      let pos = camera.position
      pos[idx] = value
      camera.position = pos
      camera.update()
    })
    ui.number("Dolly", 0, -100, 100, 0.1, (v) => camera.dolly(v))
    ui.number("Elevation", 0, -180, 180, 0.1, (v) => {
      camera.elevation = v
      camera.update()
    })
    ui.number("Azimuth", 0, -180, 180, 0.1, (v) => {
      camera.azimuth = v
      camera.update()
    })
    ui.action("Go Home", () => camera.goHome())
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = () => {
    space.fitHorizontal()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clearColor(0.9, 0.9, 0.9, 1)
    gl.clearDepth(100)

    program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()
    uniforms = new UniformLoader(gl, program, ["uWireframe"])

    light = new PointLight(gl, program)
    light.position = [0, 120, 120]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [0.2, 0.2, 0.2, 1]

    camera = new AngleCamera("TRACK")
    camera.fov = 45
    camera.near = 0.1
    camera.far = 1000
    camera.home = [0, 2, 50]
    camera.goHome()

    new AngleCameraController(canvas, camera)

    transforms = new Transforms(gl, program, camera, canvas)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const floor = new Floor(80, 2)
    const axis = new Axis(82)

    scene.add({ alias: "floor", ...floor.model, diffuse: [1, 1, 1, 1] })
    scene.add({ alias: "axis", ...axis.model, diffuse: [1, 1, 1, 1] })
    scene.add({ alias: "cone", ...coneModel })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    matModel = camera.View

    light.updateNormalMatrixFrom(Matrix4.identity())
    light.setUniforms()

    transforms.ModelView = matModel
    transforms.setMatrixUniforms()

    scene.traverseDraw((obj) => {
      uniforms.boolean("uWireframe", !!obj.wireframe)
      obj.material?.setUniforms()

      obj.bind()

      const mode = obj.wireframe ? gl.LINES : gl.TRIANGLES
      gl.drawElements(mode, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = () => {
    configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
