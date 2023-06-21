import { Space } from "@/lib/canvas/index"
import { Clock } from "@/lib/event/clock"
import { Timer } from "@/lib/control/timer"
import { UniformManager } from "@/lib/webgl/uniform-manager"
import { ImageTexture } from "@/lib/webgl/image-texture"
import { Instancing } from "@/lib/webgl/instancing"
import { Program } from "@/lib/webgl/gl-program"

import vert from "./render.vert?raw"
import frag from "./render.frag?raw"

import sprite from "@/assets/for-particle/lace23.png"

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

  let spriteTexture: ImageTexture

  // 頂点座標 (x, y)
  const vertices = [-0.05, 0.05, 0.05, -0.05, -0.05, -0.05, -0.05, 0.05, 0.05, -0.05, 0.05, 0.05]

  // テクスチャ座標 (u, v)
  const texcoords = [0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]

  let instances: number

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = async () => {
    space.fitScreenSquare()

    instances = 70

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
    ist.registAttrib({ location: 1, components: 2, buffer: new Float32Array(texcoords) })
    ist.registAttrib({ location: 2, components: 2, buffer: new Float32Array(instance()), divisor: 1 })

    ist.setupAttribs()

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    //gl.blendFunc(gl.DST_ALPHA, gl.ONE)

    //gl.enable(gl.DEPTH_TEST)

    gl.clearColor(0.118, 0.235, 0.447, 1.0)

    uniforms = new UniformManager(gl, program.get()!)
    uniforms.init(["uAspect", "uResolution", "uTime"])

    spriteTexture = new ImageTexture(gl, sprite)
    spriteTexture.MAG_FILTER = "LINEAR"
    spriteTexture.MIN_FILTER = "LINEAR"
    await spriteTexture.load()

    clock = new Clock()

    timer = new Timer()
    timer.start()

    space.onResize = onResize
  }

  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    ist.bind()

    program.activate()
    spriteTexture.activate(program.get()!, "uSprite")
    uniforms.float("uAspect", canvas.width / canvas.height)
    uniforms.fvector2("uResolution", [canvas.width, canvas.height])
    uniforms.float("uTime", timer.elapsed * 0.001)

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, instances)
  }

  const init = async () => {
    await configure()
    clock.on("tick", render)
  }

  init()
}
