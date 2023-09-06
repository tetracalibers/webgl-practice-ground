import { SketchFrg, type FragmentSketchConfig, type FragmentSketchFn } from "sketchgl"
import { Uniforms } from "sketchgl/program"

import frag from "./index.frag"

const sketch: FragmentSketchFn = ({ gl, canvas, program, renderToCanvas }) => {
  const uniforms = new Uniforms(gl, ["uResolution"])
  uniforms.init(program)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  return {
    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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
      fit: "screen",
      autoResize: true
    }
  }
  SketchFrg.init(config, sketch)
}
