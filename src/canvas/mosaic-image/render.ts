import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { Texture } from "@/lib/webgl/texture"
import { UniformLoader } from "@/lib/webgl/uniform-loader"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

import imageGeometry from "@/assets/256x256/pastel-tomixy.png"
import imagePattern from "@/assets/256x256/usg-pattern.png"
import imageSketch from "@/assets/original/vector3d.jpg"
import imageStone from "@/assets/256x256/stone_00006.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let textures: Texture[] = []

  const uniforms = new UniformLoader(gl, ["uCellSize", "uMethod"])

  const images = [
    { name: "岩", image: imageStone },
    { name: "立方体", image: imageGeometry },
    { name: "幾何パターン", image: imagePattern },
    { name: "図", image: imageSketch }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 1

  const methods = ["平均値", "代表点"]
  const defaultMethodIdx = 0
  const defaultCellSize = 5

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", images[activeImage].name, imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.select("CalcBy", methods[defaultMethodIdx], methods, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      uniforms.int("uMethod", idx)
    })
    ui.number("CellSize", defaultCellSize, 1, 10, 1, (value) => {
      uniforms.int("uCellSize", value)
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

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image)
        textures.push(texture)
        await texture.load()
      })
    )

    uniforms.init(program)
    uniforms.int("uCellSize", defaultCellSize)
    uniforms.int("uMethod", defaultMethodIdx)

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
