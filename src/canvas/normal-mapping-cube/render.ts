import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Clock } from "@/lib/event/clock"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"
import { Texture } from "@/lib/webgl/texture"
import { Light } from "@/lib/light/light"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import cubeModel from "@/lib/model/cube-texture.json" assert { type: "json" }

import image from "@/assets/542x542/usg-pattern.png"
import normalMap from "@/assets/normal-map/usg-pattern.png"

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
  let normalTexture: Texture

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

    program = new Program(gl, vertexSource, fragmentSource)
    scene = new Scene(gl, program)

    light = new Light(gl, program)
    light.position = [0, 5, 20]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [1, 1, 1, 1]
    light.useMaterial = ["ambient", "diffuse"]
    light.setUniformLocations()
    light.setUniforms()

    camera = new AngleCamera("ORBIT")
    camera.goHome([0, 0, 2.5])
    camera.azimuth = 40
    camera.elevation = -30
    camera.focus = [0, 0, 0]
    camera.update()

    new AngleCameraController(canvas, camera)

    transforms = new Transforms(gl, program, camera, canvas)
    clock = new Clock()

    texture = new Texture(gl, program, image, 0)
    await texture.load()

    normalTexture = new Texture(gl, program, normalMap, 1)
    await normalTexture.load()

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

    texture.use()
    normalTexture.use()

    scene.traverseDraw((obj) => {
      obj.material?.setUniforms()
      obj.bind()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)
  }

  init()
}
