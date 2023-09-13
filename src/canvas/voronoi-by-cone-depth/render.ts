import { SketchConfig, SketchGl, SketchFn } from "sketchgl"
import { Program } from "sketchgl/program"
import { InstancedGeometry } from "sketchgl/geometry"
import { Vector2 } from "sketchgl/math"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag"

const RESOLUTION = 64
const SITE_COUNT = 500

const generateConeVertex = (canvas: HTMLCanvasElement) => {
  const w = canvas.width
  const h = canvas.height
  const a = new Vector2(w, h).normalize()

  let cone = [0, 0, -0.95]

  for (let i = 0; i < RESOLUTION; i++) {
    const v = (i / (RESOLUTION - 1)) * Math.PI * 2
    cone.push(Math.cos(v) * a.y * 2)
    cone.push(Math.sin(v) * a.x * 2)
    cone.push(1.0)
  }

  return cone
}

const generatePoints = (count: number) => {
  const points = []

  for (let i = 0; i < count; i++) {
    points.push(Math.random(), Math.random())
  }

  return points
}

const sketch: SketchFn = ({ gl, canvas }) => {
  const cone = new InstancedGeometry(gl)
  cone.registAttrib("vertice", {
    location: 0,
    components: 3,
    buffer: new Float32Array(generateConeVertex(canvas)),
    divisor: 0
  })
  cone.registAttrib("offset", {
    location: 1,
    components: 2,
    buffer: new Float32Array(generatePoints(SITE_COUNT)),
    divisor: 1
  })
  cone.setup()

  const program = new Program(gl)
  program.attach(mainVertSrc, mainFragSrc)
  program.activate()

  gl.enable(gl.BLEND)
  gl.enable(gl.DEPTH_TEST)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  gl.clearColor(1.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  return {
    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      cone.bind()
      cone.draw({ primitive: "TRIANGLE_FAN", instanceCount: SITE_COUNT })
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fit: "screen",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
