import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { Texture } from "@/lib/webgl/texture"
import { cube } from "@/lib/shape/cube"
import { sphere } from "@/lib/shape/sphere"
import { Light } from "@/lib/webgl/light"
import { Vector3 } from "@/lib/math/vector"
import { OffscreenRenderer } from "@/lib/webgl/offscreen-renderer"
import { TextureParamsManager } from "@/lib/webgl/texture-params-manager"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import imageCube from "@/assets/256x256/wallpaper_00313.png"
import imageSphere from "@/assets/128x128/fireworks_00018.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let offscene: Scene
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let light: Light
  let textureCube: Texture
  let textureSphere: Texture
  let offscreen: OffscreenRenderer
  let count = 0

  const onResize = () => {
    space.fitScreen()
    offscreen.resize()
    render()
  }

  const configure = async () => {
    space.fitScreenSquare()

    // 深度テストを有効にする
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    offscene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.position = [0.0, 0.0, 5.0]
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)

    light = new Light(gl, program)

    const textureConfig = new TextureParamsManager(gl)
    textureConfig.MIN_FILTER = "LINEAR"
    textureConfig.MAG_FILTER = "LINEAR"
    textureConfig.WRAP_T = "REPEAT"
    textureConfig.WRAP_S = "REPEAT"

    textureCube = new Texture(gl, program, imageCube, 0, textureConfig)
    await textureCube.load()

    textureSphere = new Texture(gl, program, imageSphere, 0, textureConfig)
    await textureSphere.load()

    const fTextureConfig = new TextureParamsManager(gl)
    fTextureConfig.MIN_FILTER = "LINEAR"
    fTextureConfig.MAG_FILTER = "LINEAR"

    offscreen = new OffscreenRenderer(gl, canvas, fTextureConfig)

    space.onResize = onResize
  }

  const regiisterGeometry = () => {
    const sphereGeometry = sphere(1.0, 64, 64)
    const cubeGeometry = cube(2.0)

    offscene.add({ alias: "sphere", ...sphereGeometry })
    scene.add({ alias: "cube", ...cubeGeometry })
  }

  const drawOne = (indices: number[]) => {
    transforms.pop()
    transforms.setMatrixUniforms()
    light.reflect()
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    count++
    const rad = ((count % 360) * Math.PI) / 180
    const rad2 = ((count % 720) * Math.PI) / 360

    /* フレームバッファに描き込む -------------------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen.frameBuffer)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    light.direction = [-1.0, 2.0, 1.0]

    offscene.traverseDraw((obj) => {
      obj.bind()

      textureCube.use()
      light.disable()
      transforms.push(Matrix4.identity().scale(50.0, 50.0, 50.0))
      drawOne(obj.indices)

      textureSphere.use()
      light.enable()
      transforms.push(Matrix4.identity().rotateY(rad))
      drawOne(obj.indices)

      obj.cleanup()
    })

    /* キャンバスに描き込む ------------------------------ */

    // フレームバッファのバインドを解除
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // canvasを初期化
    gl.clearColor(0.931, 0.935, 0.95, 1.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const rotateAxis = new Vector3(1.0, 1.0, 0.0).normalize()
    light.direction = [-1.0, 0.0, 0.0]

    scene.traverseDraw((obj) => {
      obj.bind()

      offscreen.useAsTexture()
      light.reflect()
      transforms.push(Matrix4.identity().rotateAround(rotateAxis, rad2))
      drawOne(obj.indices)

      obj.cleanup()
    })
  }

  const init = async () => {
    await configure()
    regiisterGeometry()
    clock.on("tick", render)
  }

  init()
}
