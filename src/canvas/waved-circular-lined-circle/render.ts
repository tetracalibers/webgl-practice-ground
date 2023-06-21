import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Clock } from "@/lib/event/clock"
import { Timer } from "@/lib/control/timer"
import { UniformManager } from "@/lib/webgl/uniform-manager"
import { Instancing } from "@/lib/webgl/instancing"
import { Program } from "@/lib/webgl/gl-program"
import { ControlUi } from "@/lib/gui/control-ui"

import vert from "./render.vert?raw"
import frag from "./render.frag?raw"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let clock: Clock
  let ist: Instancing
  let program: Program
  let uniforms: UniformManager
  let timer: Timer

  let clearColor: RawVector3 = [0.345, 0.529, 0.776]

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgb("Background", clearColor, (color) => (clearColor = color))
  }

  const generateCircleVertices = (radius: number, vertexCount: number) => {
    const vertices = []
    const angleIncrement = (2 * Math.PI) / vertexCount

    for (let i = 0; i <= vertexCount; i++) {
      const angle = i * angleIncrement
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)

      vertices.push(x, y)
    }

    return vertices
  }

  // 頂点座標 (x, y)
  const vertices = generateCircleVertices(0.05, 32)

  let instances: number

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = async () => {
    space.fitScreenSquare()

    instances = 100

    const instance = () => {
      const data = []

      for (let i = 0; i < instances; i++) {
        const theta = (Math.PI * 2 * i) / instances
        data.push(Math.cos(theta), Math.sin(theta))
      }

      return data
    }

    ist = new Instancing(gl)

    program = new Program(gl)
    program.attach(vert, frag)

    ist.registAttrib({ location: 0, components: 2, buffer: new Float32Array(vertices) })
    ist.registAttrib({ location: 2, components: 2, buffer: new Float32Array(instance()), divisor: 1 })

    ist.setupAttribs()

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    uniforms = new UniformManager(gl, program.get()!)
    uniforms.init(["uAspect", "uResolution", "uTime"])

    clock = new Clock()

    timer = new Timer()
    timer.start()

    space.onResize = onResize
  }

  const render = () => {
    gl.clearColor(...clearColor, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    ist.bind()

    program.activate()
    uniforms.float("uAspect", canvas.width / canvas.height)
    uniforms.fvector2("uResolution", [canvas.width, canvas.height])
    uniforms.float("uTime", timer.elapsed * 0.001)

    gl.drawArraysInstanced(gl.LINE_STRIP, 0, vertices.length / 2, instances)
  }

  const init = async () => {
    await configure()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
