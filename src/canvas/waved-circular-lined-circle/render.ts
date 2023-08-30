import { SketchGl, type SketchConfig, SketchFn } from "sketchgl"
import type { RawVector3 } from "sketchgl/math"
import { InstancedCircle2D } from "sketchgl/geometry"
import { Program, Uniforms } from "sketchgl/program"
import { Timer } from "sketchgl/interactive"

import vert from "./render.vert?raw"
import frag from "./render.frag?raw"

const sketch: SketchFn = ({ gl, canvas }) => {
  let clearColor: RawVector3 = [0.345, 0.529, 0.776]

  const uniforms = new Uniforms(gl, ["uTime"])

  const program = new Program(gl)
  program.attach(vert, frag)
  program.activate()

  uniforms.init(program.glProgram)

  const circle = new InstancedCircle2D(gl, {
    radius: 0.05,
    segments: 32,
    instanceCount: 100,
    calcOffset: (instanceCount) => {
      const data = []

      for (let i = 0; i < instanceCount; i++) {
        const theta = (Math.PI * 2 * i) / instanceCount
        data.push(Math.cos(theta), Math.sin(theta))
      }

      return {
        components: 2,
        buffer: new Float32Array(data),
        divisor: 1
      }
    }
  })
  circle.setLocations({ vertices: 0, offset: 1 })

  const timer = new Timer()
  timer.start()

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

  return {
    drawOnFrame() {
      gl.clearColor(...clearColor, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      circle.bind()
      uniforms.float("uTime", timer.elapsed * 0.001)
      circle.draw({ primitive: "LINE_STRIP" })
    },

    control(ui) {
      ui.rgb("Background", clearColor, (color) => {
        clearColor = color
      })
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fit: "square",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
