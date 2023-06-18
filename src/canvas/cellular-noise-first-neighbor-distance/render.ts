import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Timer } from "@/lib/control/timer"
import { Clock } from "@/lib/event/clock"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { MouseCoords } from "@/lib/control/mouse-coords"

import vert from "./index.vert?raw"
import frag from "./index.frag?raw"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let timer: Timer
  let clock: Clock
  let mouse: MouseCoords

  const uniforms = new UniformLoader(gl, ["uResolution", "uTime", "uMouse"])

  const onResize = () => {
    space.fitScreen()
    render()
  }

  const configure = () => {
    space.fitScreen()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    const program = new Program(gl, vert, frag)

    clock = new Clock()
    timer = new Timer()
    mouse = new MouseCoords(canvas)

    uniforms.init(program)

    timer.start()
    space.onResize = onResize
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    uniforms.float("uTime", timer.elapsed * 0.001)
    uniforms.fvector2("uResolution", [canvas.width, canvas.height])
    uniforms.fvector2("uMouse", mouse.xy)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3)
  }

  const init = () => {
    configure()
    clock.on("tick", render)
  }

  init()
}
