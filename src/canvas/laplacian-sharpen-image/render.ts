import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

import imageCrochet from "@/assets/original/handmade-blue-cat.jpg"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageTwinkle from "@/assets/original/twinkle_00029.jpg"
import imageTree from "@/assets/original/tree-woods_00123.jpg"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let textures: Texture[] = []

  const uniforms = new UniformLoader(gl, ["uGrayScaleOn", "uCoef"])

  const images = [
    { name: "木", image: imageTree },
    { name: "編みぐるみ", image: imageCrochet },
    { name: "金魚鉢", image: imageGoldfishBowl },
    { name: "キラキラ", image: imageTwinkle }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 2

  const defaultCoef = 1.0
  const defaultGrayScaleOn = false

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", imageNames[activeImage], imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.number("Sharpen Coef", defaultCoef, 0.0, 4.0, 0.1, (value) => {
      uniforms.float("uCoef", value)
    })
    ui.boolean("GrayScale", defaultGrayScaleOn, (isActive) => {
      uniforms.boolean("uGrayScaleOn", isActive)
    })
  }

  const onResize = () => {
    space.fitImage(textures[activeImage].image)
    render()
  }

  const configure = async () => {
    gl.clearColor(1.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    program = new Program(gl, mainVertSrc, mainFragSrc)

    scene = new Scene(gl, program)
    clock = new Clock()

    uniforms.init(program)
    uniforms.float("uCoef", defaultCoef)
    uniforms.boolean("uGrayScaleOn", defaultGrayScaleOn)

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image)
        textures.push(texture)
        await texture.load()
      })
    )

    space.fitImage(textures[activeImage].image)
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    scene.traverseDraw((obj) => {
      obj.bind()

      textures[activeImage].use()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
