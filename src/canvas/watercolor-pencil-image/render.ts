import { SketchFilter, type FilterSketchConfig, type FilterSketchFn } from "sketchgl"
import { Uniforms, Program } from "sketchgl/program"
import type { RawVector3 } from "sketchgl/math"
import { ImageTexture } from "sketchgl/texture"
import { MRTRenderer } from "sketchgl/renderer"
import { CanvasCoverPolygon } from "sketchgl/geometry"

import vertSrc from "./common.vert?raw"
import fragSrcForEdge from "./edge.frag?raw"
import fragSrcForDrawStroke from "./draw-stroke.frag?raw"

import imageCubeLogo from "@/assets/original/pastel-tomixy.png"
import imageGoldfishBowl from "@/assets/original/japanese-style_00011.jpg"
import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageTree from "@/assets/original/tree-woods_00123.jpg"

const sketch: FilterSketchFn = ({ gl, canvas, fitImage }) => {
  const uniformsFor = {
    level: new Uniforms(gl, [
      "uGamma",
      "uHue",
      "uSaturation",
      "uBrightness",
      "uLevelH",
      "uLevelS",
      "uLevelB",
      "uMinDensity"
    ]),
    drawStroke: new Uniforms(gl, ["uTexture1", "uTexture2", "uTexture3", "uColored", "uDepthStroke", "uBlendMode"])
  }

  const blendModes = ["multiply", "lighten", "overlay", "screen", "colorburn"]
  let uBlendMode = 0
  let uGamma = 1.0
  let uHue = 0.0
  let uSaturation = 1.0
  let uBrightness = 1.0
  let uLevelH = 256
  let uLevelS = 2
  let uLevelB = 128
  let uMinDensity: RawVector3 = [0.3, 0.3, 0.3]
  let uColored = true
  let uDepthStroke = 1.0

  const images = [
    { name: "木", src: imageTree },
    { name: "立方体ロゴ", src: imageCubeLogo },
    { name: "金魚鉢", src: imageGoldfishBowl },
    { name: "紅葉", src: imageAutumnLeaves }
  ]
  const imageNames = images.map((obj) => obj.name)
  const textures = images.map((img) => new ImageTexture(gl, img.src))
  let activeImage = 2

  const renderer = new MRTRenderer(gl, canvas, vertSrc, fragSrcForEdge, { texCount: 2 })
  uniformsFor.level.init(renderer.glProgramForOffscreen)

  const program = new Program(gl)
  program.attach(vertSrc, fragSrcForDrawStroke)
  uniformsFor.drawStroke.init(program.glProgram)

  const plane = new CanvasCoverPolygon(gl)
  plane.setLocations({ vertices: 0, uv: 1 })

  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clearDepth(1.0)

  return {
    resize: [renderer.resize],

    preload: [...textures.map((tex) => tex.load())],
    preloaded: [() => fitImage(textures[activeImage].img)],

    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      plane.bind()

      /* to Offscreens（エッジ抽出 / 輝度調整・階調数低減） ------------------------ */

      renderer.switchToOffcanvas()
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      uniformsFor.level.float("uGamma", uGamma)
      uniformsFor.level.float("uHue", uHue)
      uniformsFor.level.float("uSaturation", uSaturation)
      uniformsFor.level.float("uBrightness", uBrightness)
      uniformsFor.level.int("uLevelH", uLevelH)
      uniformsFor.level.int("uLevelS", uLevelS)
      uniformsFor.level.int("uLevelB", uLevelB)
      uniformsFor.level.fvector3("uMinDensity", uMinDensity)

      textures[activeImage].activate(renderer.glProgramForOffscreen!, "uTexture0")
      plane.draw({ primitive: "TRIANGLES" })

      /* to Canvas（ストローク描画） ----------------------- */

      renderer.switchToCanvas(program)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      uniformsFor.drawStroke.bool("uColored", uColored)
      uniformsFor.drawStroke.float("uDepthStroke", uDepthStroke)
      uniformsFor.drawStroke.int("uBlendMode", uBlendMode)

      renderer.useAsTexture(0, "uTexture3", program.glProgram)
      renderer.useAsTexture(1, "uTexture1", program.glProgram)
      plane.draw({ primitive: "TRIANGLES" })
    },

    control(ui) {
      ui.select("Image", imageNames[activeImage], imageNames, (name) => {
        const idx = imageNames.indexOf(name)
        if (idx < 0) return
        activeImage = idx
        fitImage(textures[activeImage].img)
      })
      ui.number("Gamma", uGamma, 0.0, 2.0, 0.01, (value) => {
        uGamma = value
      })
      ui.number("HSV.h", uHue, 0, 360, 1, (value) => {
        uHue = value
      })
      ui.number("HSV.s", uSaturation, 0.0, 1.0, 0.01, (value) => {
        uSaturation = value
      })
      ui.number("HSV.v", uBrightness, 0.0, 1.0, 0.01, (value) => {
        uBrightness = value
      })
      ui.number("Level HSV.h", uLevelH, 1, 256, 1, (value) => {
        uLevelH = value
      })
      ui.number("Level HSV.s", uLevelS, 1, 256, 1, (value) => {
        uLevelS = value
      })
      ui.number("Level HSV.v", uLevelB, 1, 256, 1, (value) => {
        uLevelB = value
      })
      ui.rgb("Min Density", uMinDensity, (color) => {
        uMinDensity = color
      })
      ui.number("線の濃さ", uDepthStroke, 0.0, 2.0, 0.01, (value) => {
        uDepthStroke = value
      })
      ui.boolean("Color", uColored, (isActive) => {
        uColored = isActive
      })
      ui.select("Blend Mode", blendModes[uBlendMode], blendModes, (name) => {
        const idx = blendModes.indexOf(name)
        if (idx < 0) return
        uBlendMode = idx
      })
    }
  }
}

export const onload = () => {
  const config: FilterSketchConfig = {
    canvas: {
      el: "gl-canvas",
      autoResize: true
    }
  }
  SketchFilter.init(config, sketch)
}
