import { Space } from "@/lib/canvas/index"
import { Clock } from "@/lib/event/clock"
import { SwapTransformFeedback } from "@/lib/webgl/swap-transform-feedback"
import { ImageCanvas } from "@/lib/canvas/image"
import { UniformManager } from "@/lib/webgl/uniform-manager"
import { Timer } from "@/lib/control/timer"
import { Matrix4 } from "@/lib/math/matrix"
import { Vector3 } from "@/lib/math/vector"
import { SpreadTextureInteraction } from "@/lib/feature/particle/spread-texture"

import vertForUpdate from "./update.vert?raw"
import fragForUpdate from "./update.frag?raw"

import vertForRender from "./render.vert?raw"
import fragForRender from "./render.frag?raw"

import image from "@/assets/542x542/waterpaint-pink-purple.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let camera: SpreadTextureInteraction
  let clock: Clock
  let tf: SwapTransformFeedback
  let programForUpdate: WebGLProgram
  let programForRender: WebGLProgram
  let uniformsForUpdate: UniformManager
  let uniformsForRender: UniformManager
  let imgCvs: ImageCanvas
  let timer: Timer

  let matVP: Matrix4

  const generateInterleavedArray = (imgCvs: ImageCanvas) => {
    const { data, width, height } = imgCvs
    if (!data) return null
    const array: number[] = []

    ;(function () {
      let i, j, l, m
      let x, y
      for (i = 0; i < height; ++i) {
        y = (i / height) * 2.0 - 1.0
        for (j = 0; j < width; ++j) {
          x = (j / width) * 2.0 - 1.0
          l = (i * width + j) * 10
          m = Math.sqrt(x * x + y * y)

          array[l] = x
          array[l + 1] = -y
          array[l + 2] = 0.0
          array[l + 3] = x / m
          array[l + 4] = -y / m
          array[l + 5] = 0.0
          array[l + 6] = data[(i * width + j) * 4] / 255
          array[l + 7] = data[(i * width + j) * 4 + 1] / 255
          array[l + 8] = data[(i * width + j) * 4 + 2] / 255
          array[l + 9] = data[(i * width + j) * 4 + 3] / 255
        }
      }
    })()

    return array
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = async () => {
    space.fitScreenSquare()

    tf = new SwapTransformFeedback(gl)

    // varyingsはインタリーブ配列と同じ順で
    programForUpdate = tf.createProgram(vertForUpdate, fragForUpdate, ["vVertexPosition", "vVelocity", "vVertexColor"])!
    programForRender = tf.createProgram(vertForRender, fragForRender)!

    // インタリーブ配列と同じ順で
    tf.registUpdateAttrib(0, 3) // aVertexPosition
    tf.registUpdateAttrib(1, 3) // aVelocity
    tf.registUpdateAttrib(2, 4) // aVertexColor

    // インタリーブ配列と同じ順で
    tf.registRenderAttrib(0, 3) // aVertexPosition
    tf.registRenderAttrib(1, 3) // aVelocity
    tf.registRenderAttrib(2, 4) // aVertexColor

    imgCvs = new ImageCanvas(image, 542, 542)
    await imgCvs.load()

    const geometry = generateInterleavedArray(imgCvs)!
    tf.setupDataAndAttrib(new Float32Array(geometry))

    uniformsForUpdate = new UniformManager(gl, programForUpdate)
    uniformsForRender = new UniformManager(gl, programForRender)

    uniformsForUpdate.init(["uTime", "uMouse", "uMove"])
    uniformsForRender.init(["uMatrix", "uMove"])

    const matV = Matrix4.view(new Vector3(0, 0, 3), new Vector3(0, 0, 0), new Vector3(0, 1, 0))
    const matP = Matrix4.perspective(45, canvas.width / canvas.height, 0.1, 10)
    matVP = matP.multiply(matV)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
    gl.disable(gl.RASTERIZER_DISCARD)

    clock = new Clock()
    camera = new SpreadTextureInteraction(canvas)

    timer = new Timer()
    timer.start()
  }

  const render = () => {
    camera.update()

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.useProgram(programForUpdate)

    uniformsForUpdate.float("uTime", timer.elapsed * 0.001)
    uniformsForUpdate.float("uMove", camera.movePower)
    uniformsForUpdate.fvector2("uMouse", camera.mouseCoords)

    tf.startUpdate()
    gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)
    tf.endUpdate()

    gl.useProgram(programForRender)

    uniformsForRender.fmatrix4v("uMatrix", matVP.values)
    uniformsForRender.float("uMove", camera.movePower)

    tf.startRender()
    gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)
    tf.endRender()
  }

  const init = async () => {
    await configure()
    clock.on("tick", render)
    space.onResize = onResize
  }

  init()
}
