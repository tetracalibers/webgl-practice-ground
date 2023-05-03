import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

// foreground
import imageTomixy from "@/assets/542x542/pastel-tomixy.png"
import imageTomixyDarken from "@/assets/542x542/darken-purple-tomixy.png"
// background
import imageWater from "@/assets/542x542/water_00032.png"
import imageTwinklePink from "@/assets/542x542/twinkle_00029.png"
import imageTwinkleDark from "@/assets/542x542/twinkle_00037.png"
import imageLightDark from "@/assets/542x542/light_00034.png"
import imageTreeWoods from "@/assets/542x542/tree-woods_00123.png"

type BlendMode =
  | "add"
  | "subtract"
  | "difference"
  | "max"
  | "min"
  | "multiply"
  | "screen"
  | "overlay"
  | "color-dodge"
  | "color-burn"

const blendModes: BlendMode[] = [
  "add",
  "subtract",
  "difference",
  "max",
  "min",
  "multiply",
  "screen",
  "overlay",
  "color-dodge",
  "color-burn"
]

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let texture0s: Texture[] = []
  let texture1s: Texture[] = []

  const uniforms = new UniformLoader(gl, ["uBlendMode"])

  const foregrounds = [
    { name: "明るめのロゴ", image: imageTomixy },
    { name: "暗めのロゴ", image: imageTomixyDarken }
  ]
  const foregroundNames = foregrounds.map((obj) => obj.name)

  const backgrounds = [
    { name: "水", image: imageWater },
    { name: "明るいキラキラ", image: imageTwinklePink },
    { name: "暗いキラキラ", image: imageTwinkleDark },
    { name: "暗いモヤモヤ", image: imageLightDark },
    { name: "木々", image: imageTreeWoods }
  ]
  const backgroundNames = backgrounds.map((obj) => obj.name)

  let activeForeground = 1
  let activeBackground = 0

  const initBlendMode = 5

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Foreground", foregroundNames[activeForeground], foregroundNames, (name) => {
      const idx = foregroundNames.indexOf(name)
      if (idx < 0) return
      activeForeground = idx
      space.fitImage(texture1s[activeForeground].image)
    })
    ui.select("Background", backgroundNames[activeBackground], backgroundNames, (name) => {
      const idx = backgroundNames.indexOf(name)
      if (idx < 0) return
      activeBackground = idx
      space.fitImage(texture0s[activeBackground].image)
    })
    ui.select<BlendMode>("Blend Mode", blendModes[initBlendMode], blendModes, (name) => {
      const idx = blendModes.indexOf(name)
      if (idx < 0) return
      uniforms.int("uBlendMode", idx)
    })
  }

  const onResize = () => {
    space.fitImage(texture0s[activeBackground].image)
    render()
  }

  const configure = async () => {
    gl.clearColor(1.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    program = new Program(gl, mainVertSrc, mainFragSrc)

    scene = new Scene(gl, program)
    clock = new Clock()

    uniforms.init(program)
    uniforms.int("uBlendMode", initBlendMode)

    await Promise.all(
      backgrounds.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image, 0)
        texture0s.push(texture)
        await texture.load()
      })
    )

    await Promise.all(
      foregrounds.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image, 1)
        texture1s.push(texture)
        await texture.load()
      })
    )

    space.fitImage(texture0s[activeBackground].image)
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

      texture0s[activeBackground].use()
      texture1s[activeForeground].use()

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
