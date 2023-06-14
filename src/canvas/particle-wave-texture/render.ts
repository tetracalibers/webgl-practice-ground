import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Clock } from "@/lib/event/clock"
import { TransformFeedback } from "@/lib/webgl/transform-feedback"
import { ImageCanvas } from "@/lib/canvas/image"
import { UniformManager } from "@/lib/webgl/uniform-manager"
import { Timer } from "@/lib/control/timer"
import { WaveParticleCamera } from "@/lib/feature/particle/wave-particle-camera"

import vertForOut from "./out.vert?raw"
import fragForOut from "./out.frag?raw"

import vertForIn from "./in.vert?raw"
import fragForIn from "./in.frag?raw"

import image from "@/assets/542x542/waterpaint-pink-purple.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let camera: WaveParticleCamera
  let clock: Clock
  let tf: TransformFeedback
  let programOut: WebGLProgram
  let programIn: WebGLProgram
  let uniformsOut: UniformManager
  let uniformsIn: UniformManager
  let imgCvs: ImageCanvas
  let timer: Timer

  const generateImgVertices = (imgCvs: ImageCanvas) => {
    const { data, width, height } = imgCvs
    if (!data) return null
    const positions: number[] = []
    const colors: number[] = []
    const feedbackPositions: number[] = []
    const feedbackColors: number[] = []

    ;(function () {
      var i, j, k, l
      var x, y
      for (i = 0; i < height; ++i) {
        y = (i / height) * 2.0 - 1.0
        k = i * width
        for (j = 0; j < width; ++j) {
          x = (j / width) * 2.0 - 1.0
          l = (k + j) * 4
          positions.push(x, -y, 0.0, 1.0)
          colors.push(data[l] / 255, data[l + 1] / 255, data[l + 2] / 255, data[l + 3] / 255)
          feedbackPositions.push(0.0, 0.0, 0.0, 0.0)
          feedbackColors.push(0.0, 0.0, 0.0, 0.0)
        }
      }
    })()

    return {
      out: {
        positions,
        colors
      },
      in: {
        positions: feedbackPositions,
        colors: feedbackColors
      }
    }
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = async () => {
    space.fitScreenSquare()

    timer = new Timer()

    tf = new TransformFeedback(gl)

    programOut = tf.createSeparateProgram(vertForOut, fragForOut, ["gl_Position", "vVertexColor"])!
    programIn = new Program(gl, vertForIn, fragForIn, false).get()!

    uniformsOut = new UniformManager(gl, programOut)
    uniformsIn = new UniformManager(gl, programIn)

    uniformsOut.init(["uTime", "uMouse"])
    uniformsIn.init(["uMatrix"])

    imgCvs = new ImageCanvas(image, 542, 542)
    await imgCvs.load()

    const geometry = generateImgVertices(imgCvs)!

    tf.setOutPositionVBO(geometry.out.positions, 0)
    tf.setOutColorVBO(geometry.out.colors, 1)

    tf.setInPositionVBO(geometry.in.positions, 0)
    tf.setInColorVBO(geometry.in.colors, 1)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
    gl.disable(gl.RASTERIZER_DISCARD)

    clock = new Clock()
    camera = new WaveParticleCamera(canvas, 3.0)

    timer.start()
    space.onResize = onResize
  }

  const render = () => {
    camera.update()

    gl.useProgram(programOut)

    tf.updateOutVBO()
    tf.beginTransformFeedback()

    uniformsOut.float("uTime", timer.elapsed * 0.001)
    uniformsOut.fvector2("uMouse", camera.mouseCoords)

    gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)

    tf.endTransformFeedback()

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.useProgram(programIn)

    tf.updateInVBO()

    uniformsIn.fmatrix4v("uMatrix", camera.matrix.values)

    gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)

    gl.flush()
  }

  const init = async () => {
    await configure()
    clock.on("tick", render)
  }

  init()
}
