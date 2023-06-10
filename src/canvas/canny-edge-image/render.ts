import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"
import { Frame } from "@/lib/webgl/frame"

import vertSrc from "./index.vert?raw"
import fragSrcForGauss from "./gauss.frag?raw"
import fragSrcForGrad from "./grad.frag?raw"
import fragSrcForCanny from "./canny.frag?raw"

import imageMountain from "@/assets/original/mountain_00003.jpg"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageCube from "@/assets/original/darken-purple-tomixy.png"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let clock: Clock
  let textures: Texture[] = []
  let offscreen1: Frame
  let offscreen2: Frame
  let offscreen3: Frame

  const uniformsForGaussX = new UniformLoader(gl, ["uDirection", "uFilterSize", "uSigma"])
  const uniformsForGaussY = new UniformLoader(gl, ["uDirection", "uFilterSize", "uSigma"])
  const uniformsForGrad = new UniformLoader(gl, [])
  const uniformsForCanny = new UniformLoader(gl, ["uThreshold"])

  const images = [
    { name: "立方体ロゴ", image: imageCube },
    { name: "山", image: imageMountain },
    { name: "金魚鉢", image: imageGoldfishBowl },
    { name: "紅葉", image: imageAutumnLeaves }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 2

  let sigma = 5.0
  let filterSize = 3
  let threshould = 0.04

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", imageNames[activeImage], imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.number("標準偏差", sigma, 0.01, 5.0, 0.01, (v) => (sigma = v))
    ui.select("フィルタサイズ", "3x3", ["1x1", "3x3", "5x5"], (v) => (filterSize = ~~v[0]))
    ui.number("閾値", threshould, 0.01, 0.1, 0.001, (v) => (threshould = v))
  }

  const onResize = () => {
    space.fitImage(textures[activeImage].image)
    offscreen1.resize()
    offscreen2.resize()
    offscreen3.resize()
    render()
  }

  const configure = async () => {
    gl.clearColor(1.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    program = new Program(gl, vertSrc, fragSrcForCanny, false)

    scene = new Scene(gl, program)
    clock = new Clock()

    offscreen1 = new Frame(gl, canvas, vertSrc, fragSrcForGauss, 0)
    offscreen2 = new Frame(gl, canvas, vertSrc, fragSrcForGauss, 0)
    offscreen3 = new Frame(gl, canvas, vertSrc, fragSrcForGrad, 0)

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, offscreen1.program, obj.image)
        textures.push(texture)
        await texture.load()
      })
    )

    uniformsForGaussX.init(offscreen1.program)
    uniformsForGaussY.init(offscreen2.program)
    uniformsForGrad.init(offscreen3.program)
    uniformsForCanny.init(program)

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

    /* to Offscreen (horizontal blur) ------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen1.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    offscreen1.program.use()

    uniformsForGaussX.int("uDirection", 0)
    uniformsForGaussX.int("uFilterSize", filterSize)
    uniformsForGaussX.float("uSigma", sigma)

    scene.traverseDraw((obj) => {
      obj.bind()

      textures[activeImage].use()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* to Offscreen (vertical blur) ------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen2.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    offscreen2.program.use()

    uniformsForGaussY.int("uDirection", 1)
    uniformsForGaussY.int("uFilterSize", filterSize)
    uniformsForGaussY.float("uSigma", sigma)

    scene.traverseDraw((obj) => {
      obj.bind()

      offscreen1.useTextureOn(0, offscreen2.program)
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* to Offscreen (Gradient) ------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen3.framebuffer)

    offscreen3.program.use()

    scene.traverseDraw((obj) => {
      obj.bind()

      offscreen2.useTextureOn(0, offscreen3.program)
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* to Canvas (Canny Edge Detection) ------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()

    uniformsForCanny.float("uThreshold", threshould)

    scene.traverseDraw((obj) => {
      obj.bind()

      offscreen3.useTextureOn(0, program)
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
