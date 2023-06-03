import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { Texture } from "@/lib/webgl/texture"
import { UniformLoader } from "@/lib/webgl/uniform-loader"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageFireWorks from "@/assets/original/fireworks_00018.jpg"
import imageTomixy from "@/assets/original/pastel-tomixy.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let textures: Texture[] = []

  const uniforms = new UniformLoader(gl, ["uThresholdL", "uThresholdS", "uMaxHue", "uMinHue", "uBase"])

  const images = [
    { name: "tomixyロゴ", image: imageTomixy },
    { name: "紅葉", image: imageAutumnLeaves },
    { name: "金魚鉢", image: imageGoldfishBowl },
    { name: "花火", image: imageFireWorks }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 1

  const bases = ["明度", "彩度", "彩度と色相"]
  const defaultBaseIdx = 0

  const defaultThreshold = 0.5

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", images[activeImage].name, imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    const controllerThL = ui.number("明度の閾値", defaultThreshold, 0.0, 1.0, 0.01, (v) => {
      uniforms.float("uThresholdL", v)
    })
    const controllerThS = ui.number("彩度の閾値", defaultThreshold, 0.0, 1.0, 0.01, (v) => {
      uniforms.float("uThresholdS", v)
    })
    const controllerMinHue = ui.number("色相の最小値", 0.01, 0.01, 0.09, 0.01, (v) => {
      uniforms.float("uMinHue", v)
    })
    const controllerMaxHue = ui.number("色相の最大値", 0.09, 0.01, 0.09, 0.01, (v) => {
      uniforms.float("uMaxHue", v)
    })

    const toggleControllers = (idx: number) => {
      switch (idx) {
        case 0:
          controllerThL.show()
          controllerThS.hide()
          controllerMinHue.hide()
          controllerMaxHue.hide()
          break
        case 1:
          controllerThL.hide()
          controllerThS.show()
          controllerMinHue.hide()
          controllerMaxHue.hide()
          break
        case 2:
          controllerThL.hide()
          controllerThS.show()
          controllerMinHue.show()
          controllerMaxHue.show()
        default:
          break
      }
    }

    ui.select("Based On", bases[defaultBaseIdx], bases, (v) => {
      const idx = bases.indexOf(v)
      uniforms.int("uBase", idx)
      toggleControllers(idx)
    })

    toggleControllers(defaultBaseIdx)
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

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image)
        textures.push(texture)
        await texture.load()
      })
    )

    uniforms.init(program)
    uniforms.int("uBase", ~~bases[defaultBaseIdx])
    uniforms.float("uThresholdS", defaultThreshold)
    uniforms.float("uThresholdL", defaultThreshold)
    uniforms.float("uMinHue", 0.0)
    uniforms.float("uMaxHue", 1.0)

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
