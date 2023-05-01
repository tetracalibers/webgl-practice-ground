import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { torus } from "@/lib/shape/torus"
import { Vector3 } from "@/lib/math/vector"
import { Clock } from "@/lib/event/clock"
import { Light } from "@/lib/webgl/light"
import { hsvaToRgba } from "@/lib/shape/color"
import { Frame } from "@/lib/webgl/frame"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

import filterVertSrc from "./filter.vert?raw"
import filterFragSrc from "./filter.frag?raw"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let light: Light
  let offscreen: Frame

  let count = 0
  let count2 = 0

  const onResize = () => {
    space.fitScreenSquare()
    offscreen.resize()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.enable(gl.CULL_FACE)

    program = new Program(gl, mainVertSrc, mainFragSrc, false)

    camera = new Camera()
    camera.fov = 90
    camera.near = 0.1
    camera.far = 100

    scene = new Scene(gl, program)
    offscreen = new Frame(gl, canvas, filterVertSrc, filterFragSrc, 0)
    transforms = new Transforms(gl, program, camera, canvas)
    light = new Light(gl, program)
    clock = new Clock()

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const torusGeometry = torus(2.0, 1.0, 64, 64, [1.0, 1.0, 1.0, 1.0])
    scene.add(torusGeometry)
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    count++
    count % 2 === 0 && count2++
    const rad = ((count % 360) * Math.PI) / 180

    /* フレームバッファに描き込む -------------------------- */

    // フレームバッファのバインド
    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen.frameBuffer)

    // フレームバッファの初期化
    const hsv = hsvaToRgba(count2 % 360, 1.0, 1.0, 1.0)
    gl.clearColor(...hsv)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()

    camera.eye = [0.0, 0.0, 0.0]
    camera.position = [0.0, 20.0, 0.0]
    camera.up = [0.0, 0.0, -1.0]
    camera.update()

    const torusCount = 9

    // トーラスをレンダリング
    scene.traverseDraw((obj) => {
      obj.bind()

      for (let i = 0; i < torusCount; i++) {
        const model = Matrix4.identity()
          .rotateY((i * 2 * Math.PI) / torusCount)
          .translate(0.0, 0.0, 10.0)
          .rotateAround(new Vector3(1.0, 1.0, 0.0).normalize(), rad)

        light.ambientColor = hsvaToRgba(i * 40, 1, 1, 1)
        light.direction = [-0.577, 0.577, 0.577]
        light.model = model
        light.eye = camera.position
        light.reflect()

        transforms.Model = model
        transforms.setMatrixUniforms()

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      }

      obj.cleanup()
    })

    /* キャンバスに描き込む ------------------------------ */

    // フレームバッファのバインドを解除
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // canvasを初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    offscreen.bind()
    offscreen.draw()
  }

  const init = () => {
    configure()
    registerGeometry()
    clock.on("tick", render)
  }

  init()
}
