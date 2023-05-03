import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag?raw"

import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageFireWorks from "@/assets/original/fireworks_00018.jpg"
import imageTomixy from "@/assets/original/pastel-tomixy.png"

type FilterType = "Prewitt" | "Sobel" | "Roberts"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let textures: Texture[] = []

  const uniforms = new UniformLoader(gl, ["uKernelX", "uKernelY", "uUseFilter", "uMonoChrome"])

  const images = [
    { name: "tomixyロゴ", image: imageTomixy },
    { name: "紅葉", image: imageAutumnLeaves },
    { name: "金魚鉢", image: imageGoldfishBowl },
    { name: "花火", image: imageFireWorks }
  ]
  const imageNames = images.map((obj) => obj.name)

  const filterTypes: FilterType[] = ["Prewitt", "Sobel", "Roberts"]
  const kernels = {
    Prewitt: {
      x: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
      y: [-1, -1, -1, 0, 0, 0, 1, 1, 1]
    },
    Sobel: {
      x: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
      y: [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    },
    Roberts: {
      x: [0, 0, 0, 0, 1, 0, 0, 0, -1],
      y: [0, 0, 0, 0, 0, 1, 0, -1, 0]
    }
  }

  let activeImage = 0
  let filterType: FilterType = "Prewitt"
  let useFilter = false
  let monochrome = false

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", "tomixyロゴ", imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.boolean("Edge detection", false, (isActive) => (useFilter = isActive))
    ui.select<FilterType>("Operator", "Prewitt", filterTypes, (mode) => (filterType = mode))
    ui.boolean("Monochrome", false, (isActive) => (monochrome = isActive))
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

    uniforms.fvector1("uKernelX", kernels[filterType].x)
    uniforms.fvector1("uKernelY", kernels[filterType].y)
    uniforms.boolean("uUseFilter", useFilter)
    uniforms.boolean("uMonoChrome", monochrome)

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
