import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { PointLight } from "@/lib/light/point-light"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import simpleCubeModel from "@/lib/model/cube-simple.json" assert { type: "json" }
import complexCubeModel from "@/lib/model/cube-complex.json" assert { type: "json" }

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

  const uniforms = new UniformLoader(gl, ["uAlpha", "uUseVertexColor", "uUseLambert"])

  let useVertexColor = false
  let alpha = 1
  let useLambert = true
  let isComplexCube = false

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.boolean("Lambert項の使用", useLambert, (v) => (useLambert = v))
    ui.boolean("頂点ごとの色付け", useVertexColor, (v) => (useVertexColor = v))
    ui.boolean("面ごとの色付け", isComplexCube, (v) => (isComplexCube = v))
    ui.boolean("ブレンディング", false, (enable) => {
      if (enable) {
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      } else {
        gl.disable(gl.BLEND)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LESS)
      }
    })
    ui.number("Alpha", alpha, 0, 1, 0.1, (v) => (alpha = v))
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = () => {
    space.fitHorizontal()

    gl.clearColor(0.9, 0.9, 0.9, 1)
    gl.clearDepth(1)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    program = new Program(gl, vertexSource, fragmentSource)
    scene = new Scene(gl, program)

    uniforms.init(program)

    light = new PointLight(gl, program)
    light.position = [0, 5, 20]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [1, 1, 1, 1]
    light.setUniforms()

    camera = new AngleCamera("ORBIT")
    camera.goHome([0, 0, 3])
    camera.azimuth = 45
    camera.elevation = -30
    camera.focus = [0, 0, 0]
    camera.update()

    new AngleCameraController(canvas, camera)

    transforms = new Transforms(gl, program, camera, canvas)
    clock = new Clock()

    space.onResize = onResize
  }

  const registerGeometry = () => {
    scene.add({ alias: "simple-cube", ...simpleCubeModel })
    scene.add({ alias: "complex-cube", ...complexCubeModel })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    transforms.ModelView = camera.View
    transforms.setMatrixUniforms()

    uniforms.float("uAlpha", alpha)
    uniforms.boolean("uUseLambert", useLambert)
    uniforms.boolean("uUseVertexColor", useVertexColor)

    scene.traverseDraw((obj) => {
      if (obj.alias === "simple-cube" && isComplexCube) return
      if (obj.alias === "complex-cube" && !isComplexCube) return

      obj.material?.setUniforms()

      obj.bind()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

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
