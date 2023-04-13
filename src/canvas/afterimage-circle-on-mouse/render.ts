import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"
import type { Attribute, Uniform } from "@/lib/webgl/shader-data.type"
import { UniformReflect } from "@/lib/webgl/uniform-reflect"
import { MouseCoords } from "@/lib/control/mouse-coords"
import { Clock } from "@/lib/event/clock"
import { Frame } from "@/lib/webgl/frame"

import compositeFragment from "./composite.frag?raw"
import postVertexSource from "./post-process.vert?raw"
import postFragmentSource from "./post-process.frag?raw"

class MainProgram extends Program<Attribute, Uniform | "uPrevTexture" | "uCurrTexture"> {}

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let program: MainProgram
  let reflect: UniformReflect
  let reflect2: UniformReflect
  let mouse: MouseCoords
  let clock: Clock
  let prevScreen: Frame
  let currScreen: Frame

  const onResize = () => {
    space.fitScreen()
    prevScreen.resize()
    currScreen.resize()
    render()
  }

  const configure = () => {
    space.fitScreen()

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)

    program = new MainProgram(gl, vertexSource, compositeFragment, false)

    mouse = new MouseCoords(canvas)
    clock = new Clock()
    prevScreen = new Frame(gl, canvas, postVertexSource, postFragmentSource)
    currScreen = new Frame(gl, canvas, postVertexSource, fragmentSource)

    const attributes: Attribute[] = []
    const uniforms: Uniform[] = ["uMouse", "uResolution"]
    currScreen.program.setAttributeLocations(attributes)
    currScreen.program.setUniformLocations(uniforms)
    reflect = new UniformReflect(gl, currScreen.program)

    program.setUniformLocations([...uniforms, "uPrevTexture", "uCurrTexture"])
    reflect2 = new UniformReflect(gl, program)

    space.onResize = onResize
  }

  const drawMain = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.useProgram()

    reflect2.resolution()
    gl.uniform1i(program.getUniformLocation("uPrevTexture"), 0)
    gl.uniform1i(program.getUniformLocation("uCurrTexture"), 1)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3)
  }

  const render = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, currScreen.frameBuffer)
    currScreen.bind(1)
    reflect.resolution()
    reflect.mouse(mouse.xy)
    currScreen.draw()

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevScreen.frameBuffer)
    prevScreen.bind(0)
    gl.bindTexture(gl.TEXTURE_2D, null)
    prevScreen.draw()

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    drawMain()
  }

  const init = () => {
    configure()
    clock.on("tick", render)
  }

  init()
}
