import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"
import { Texture } from "@/lib/webgl/texture"
import { TextureParamsManager } from "@/lib/webgl/texture-params-manager"
import { Light } from "@/lib/light/light"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import cubeModel from "@/lib/model/cube-texture.json" assert { type: "json" }

import image0 from "@/assets/256x256/tetra.png"

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
  let light: Light
  let texture: Texture

  const uniforms = new UniformLoader(gl, ["uAlpha", "uUseVertexColor", "uUseLambert"])

  const initUseVertexColor = false
  const initAlpha = 1
  const initUseLambert = true

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.boolean("Lambert項の使用", initUseLambert, (v) => uniforms.boolean("uUseLambert", v))
    ui.boolean("頂点ごとの色付け", initUseVertexColor, (v) => uniforms.boolean("uUseVertexColor", v))
    ui.number("Alpha", initAlpha, 0, 1, 0.1, (v) => uniforms.float("uAlpha", v))
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = async () => {
    space.fitHorizontal()

    gl.clearColor(0.9, 0.9, 0.9, 1)
    gl.clearDepth(100)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    program = new Program(gl, vertexSource, fragmentSource)
    scene = new Scene(gl, program)

    uniforms.init(program)
    uniforms.float("uAlpha", initAlpha)
    uniforms.boolean("uUseLambert", initUseLambert)
    uniforms.boolean("uUseVertexColor", initUseVertexColor)

    light = new Light(gl, program)
    light.position = [0, 5, 20]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [1, 1, 1, 1]
    light.useMaterial = ["ambient", "diffuse"]
    light.setUniformLocations()
    light.setUniforms()

    camera = new AngleCamera("ORBIT")
    camera.goHome([0, 0, 4])
    camera.azimuth = 45
    camera.elevation = -30
    camera.focus = [0, 0, 0]
    camera.update()

    new AngleCameraController(canvas, camera)

    transforms = new Transforms(gl, program, camera, canvas)
    clock = new Clock()

    const textureConfig = new TextureParamsManager(gl)
    textureConfig.MAG_FILTER = "NEAREST"
    textureConfig.MIN_FILTER = "NEAREST"

    texture = new Texture(gl, program, image0, 0, textureConfig)
    await texture.load()

    space.onResize = onResize
  }

  const registerGeometry = () => {
    scene.add({ alias: "cube", ...cubeModel, ambient: [0.2, 0.2, 0.2, 1] })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    transforms.ModelView = camera.View
    transforms.setMatrixUniforms()

    scene.traverseDraw((obj) => {
      obj.material?.setUniforms()

      obj.bind()
      texture.use()

      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.FRONT)
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      gl.cullFace(gl.BACK)
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      gl.disable(gl.CULL_FACE)

      obj.cleanup()
    })
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
