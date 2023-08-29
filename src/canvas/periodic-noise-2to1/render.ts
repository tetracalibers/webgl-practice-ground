import { SketchFrg, type FragmentSketchConfig, type FragmentSketchFn } from "sketchgl"
import { Timer } from "sketchgl/interactive"
import { Uniforms } from "sketchgl/program"

import frag from "./index.frag?raw"

const sketch: FragmentSketchFn = ({ gl, canvas, program, renderToCanvas }) => {
  const uniforms = new Uniforms(gl, ["uResolution", "uTime"])
  uniforms.init(program)

  const timer = new Timer()
  timer.start()

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  return {
    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      uniforms.float("uTime", timer.elapsed * 0.001)
      uniforms.fvector2("uResolution", [canvas.width, canvas.height])

      renderToCanvas()
    }
  }
}

export const onload = () => {
  const config: FragmentSketchConfig = {
    frag,
    canvas: {
      el: "gl-canvas",
      fit: "square"
    }
  }
  SketchFrg.init(config, sketch)
}
