import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Texture } from "@/lib/webgl/texture"
import { FrameMRT } from "@/lib/webgl/frame-MRT"

import vertSrc from "./common.vert?raw"
import fragSrcForEdge from "./edge.frag?raw"
import fragSrcForDrawStroke from "./draw-stroke.frag?raw"

import imageCubeLogo from "@/assets/original/cat.jpg"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
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
  // in: 原画像(0)、out1: エッジ抽出画像(1), out2: 輝度調整、階調数低減画像(2)
  let offscreen1: FrameMRT
  // in1: エッジ抽出画像(1)、in2: 輝度調整、階調数低減画像(2)、out: ストローク描画画像(canvas)

  const uniformsForLevel = new UniformLoader(gl, [
    "uGamma",
    "uHue",
    "uSaturation",
    "uBrightness",
    "uLevelH",
    "uLevelS",
    "uLevelB",
    "uMinDensity"
  ])
  const uniformsForDrawStroke = new UniformLoader(gl, ["uTexture1", "uTexture3", "uDepthStroke"])

  const images = [
    { name: "木", image: imageTree },
    { name: "猫", image: imageCubeLogo },
    { name: "金魚鉢", image: imageGoldfishBowl },
    { name: "紅葉", image: imageAutumnLeaves }
  ]
  const imageNames = images.map((obj) => obj.name)
  let activeImage = 1

  let gamma = 0.5
  let hue = 0.0
  let saturation = 1.0
  let brightness = 1.0
  let levelH = 256
  let levelS = 2
  let levelB = 128
  let minDensity: RawVector3 = [0.3, 0.3, 0.3]
  let depthStroke = 1.0

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Image", imageNames[activeImage], imageNames, (name) => {
      const idx = imageNames.indexOf(name)
      if (idx < 0) return
      activeImage = idx
      space.fitImage(textures[activeImage].image)
    })
    ui.number("Gamma", gamma, 0.0, 1.0, 0.01, (value) => (gamma = value))
    ui.number("HSV.h", hue, 0, 360, 1, (value) => (hue = value))
    ui.number("HSV.s", saturation, 0.0, 1.0, 0.01, (value) => (saturation = value))
    //ui.number("HSV.v", brightness, 0.0, 1.0, 0.01, (value) => (brightness = value))
    ui.number("Level HSV.h", levelH, 1, 256, 1, (value) => (levelH = value))
    ui.number("Level HSV.s", levelS, 1, 256, 1, (value) => (levelS = value))
    //ui.number("Level HSV.v", levelB, 1, 256, 1, (value) => (levelB = value))
    ui.rgb("Min Density", minDensity, (color) => (minDensity = color))
    ui.number("線の濃さ", depthStroke, 0.0, 2.0, 0.01, (value) => (depthStroke = value))
  }

  const onResize = () => {
    space.fitImage(textures[activeImage].image)
    offscreen1.resize()
    render()
  }

  const configure = async () => {
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)

    offscreen1 = new FrameMRT(gl, canvas, vertSrc, fragSrcForEdge, 2, 0)
    program = new Program(gl, vertSrc, fragSrcForDrawStroke, false)

    scene = new Scene(gl, program)
    clock = new Clock()

    uniformsForLevel.init(offscreen1.program)
    uniformsForDrawStroke.init(program)

    await Promise.all(
      images.map(async (obj) => {
        const texture = new Texture(gl, offscreen1.program, obj.image)
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

    /* to Offscreens（エッジ抽出 / 輝度調整・階調数低減） ------------------------ */

    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen1.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    offscreen1.program.use()

    uniformsForLevel.float("uGamma", gamma)
    uniformsForLevel.float("uHue", hue)
    uniformsForLevel.float("uSaturation", saturation)
    uniformsForLevel.float("uBrightness", brightness)
    uniformsForLevel.int("uLevelH", levelH)
    uniformsForLevel.int("uLevelS", levelS)
    uniformsForLevel.int("uLevelB", levelB)
    uniformsForLevel.fvector3("uMinDensity", minDensity)

    scene.traverseDraw((obj) => {
      obj.bind()

      textures[activeImage].use()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* to Canvas（ストローク描画） ----------------------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()

    uniformsForDrawStroke.float("uDepthStroke", depthStroke)

    scene.traverseDraw((obj) => {
      obj.bind()

      offscreen1.useTextureOn(0, "uTexture3", program)
      offscreen1.useTextureOn(1, "uTexture1", program)
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
