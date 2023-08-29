import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { InstancedSquare2D } from "sketchgl/geometry"
import { Program, Uniforms } from "sketchgl/program"
import { Timer } from "sketchgl/interactive"
import { ImageTexture } from "sketchgl/texture"

import vert from "./render.vert?raw"
import frag from "./render.frag?raw"

import sprite from "@/assets/for-particle/lace23.png"

const sketch: SketchFn = ({ gl, canvas }) => {
  const uniforms = new Uniforms(gl, ["uTime"])

  const program = new Program(gl)
  program.attach(vert, frag)
  program.activate()

  uniforms.init(program.get())

  const square = new InstancedSquare2D(gl, {
    size: 0.1,
    instanceCount: 70,
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
  square.setLocations({ vertices: 0, uv: 1, offset: 2 })

  const spriteTexture = new ImageTexture(gl, sprite)
  spriteTexture.MAG_FILTER = "LINEAR"
  spriteTexture.MIN_FILTER = "LINEAR"

  const timer = new Timer()
  timer.start()

  gl.clearColor(0.118, 0.235, 0.447, 1.0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

  return {
    preload: [spriteTexture.load()],

    drawOnFrame() {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      square.bind()

      spriteTexture.activate(program.get()!, "uSprite")
      uniforms.float("uTime", timer.elapsed * 0.001)

      square.draw({ primitive: "TRIANGLES" })
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
