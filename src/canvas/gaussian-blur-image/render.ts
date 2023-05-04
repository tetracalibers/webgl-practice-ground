import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"
import { Frame } from "@/lib/webgl/frame"

import vertSrc from "./index.vert?raw"
import fragSrc from "./index.frag?raw"

import image from "@/assets/original/japanese-style_00011.jpg"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let texture: Texture
  let offscreen: Frame

  const uniforms = new UniformLoader(gl, ["uFilterSize", "uSigma", "uDirection"])
  const offuniforms = new UniformLoader(gl, ["uFilterSize", "uSigma", "uDirection"])

  let sigma = 5.0
  let filterSize = 1

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.number("標準偏差", sigma, 1.0, 10.0, 1, (v) => (sigma = v))
    ui.select(
      "フィルタサイズ",
      "1x1（原画像）",
      ["1x1（原画像）", "3x3", "5x5", "7x7", "9x9"],
      (v) => (filterSize = +v[0])
    )
  }

  const onResize = () => {
    space.fitImage(texture.image)
    offscreen.resize()
    render()
  }

  const configure = async () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    program = new Program(gl, vertSrc, fragSrc, false)

    scene = new Scene(gl, program)
    clock = new Clock()

    texture = new Texture(gl, program, image)
    await texture.load()

    offscreen = new Frame(gl, canvas, vertSrc, fragSrc)

    uniforms.init(program)
    offuniforms.init(offscreen.program)

    space.fitImage(texture.image)
    space.onResize = onResize
  }

  const registerGeometry = () => {
    // 画面を覆う板ポリゴン
    const vertices = [-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]
    const texCoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]
    const indices = [0, 2, 1, 2, 3, 1]
    scene.add({ vertices, indices, texCoords })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    /* To Framebuffer (horizontal blur) ----------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen.framebuffer)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()

    uniforms.int("uDirection", 0)
    uniforms.float("uSigma", sigma)
    uniforms.int("uFilterSize", filterSize)

    scene.traverseDraw((obj) => {
      obj.bind()

      texture.use()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* To Canvas (vertical blur) ------------------ */

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    offscreen.bind()

    offuniforms.int("uDirection", 1)
    offuniforms.float("uSigma", sigma)
    offuniforms.int("uFilterSize", filterSize)

    offscreen.draw()
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
