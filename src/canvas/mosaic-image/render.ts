import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { Texture } from "@/lib/webgl/texture"
import { ReduceFrame } from "@/lib/feature/reduce-frame"

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
  let offcanvas: ReduceFrame

  const images = [
    { name: "岩", image: imageStone },
    { name: "立方体", image: imageGeometry },
    { name: "幾何パターン", image: imagePattern },
    { name: "図", image: imageSketch }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 1

  const defaultMosaicScale = 12

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", images[activeImage].name, imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.number("MosaicScale", defaultMosaicScale, 6, 50, 2, (value) => {
      offcanvas.changeReduceRate(value)
    })
  }

  const onResize = () => {
    space.fitImage(textures[activeImage].image)
    render()
  }

  const configure = async () => {
    gl.clearColor(1.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    program = new Program(gl, mainVertSrc, mainFragSrc, false)

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, program, obj.image)
        textures.push(texture)
        await texture.load()
      })
    )

    space.fitImage(textures[activeImage].image)

    offcanvas = new ReduceFrame(gl, defaultMosaicScale, 1)

    scene = new Scene(gl, program)
    clock = new Clock()

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
    offcanvas.switchToSmallOffcanvas()
    program.use()
    scene.traverseDraw((obj) => {
      obj.bind()
      textures[activeImage].use()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      obj.cleanup()
    })

    offcanvas.switchToCanvas()
    offcanvas.bind()
    offcanvas.drawContent()
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
