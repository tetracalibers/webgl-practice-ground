import { SketchFilter, type FilterSketchConfig, type FilterSketchFn } from "sketchgl"
import { ImageTexture } from "sketchgl/texture"
import { Program, Uniforms } from "sketchgl/program"
import { CanvasCoverPolygon } from "sketchgl/geometry"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag"

import imageGeometry from "@/assets/original/pastel-tomixy.png"
import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageWater from "@/assets/original/japanese-style_00011.jpg"
import imageGoldFish from "@/assets/original/fantasy-unicorn.jpg"

const sketch: FilterSketchFn = ({ gl, fitImage }) => {
  const uniforms = new Uniforms(gl, ["uAlpha", "uSiteCount", "uMixingRatio"])
  let uAlpha = 1.0
  let uMixingRatio = 0.5
  let uSiteCount = 36

  const images = [
    { name: "ユニコーン", src: imageGoldFish },
    { name: "立方体", src: imageGeometry },
    { name: "紅葉", src: imageAutumnLeaves },
    { name: "金魚", src: imageWater }
  ]
  const imageNames = images.map((obj) => obj.name)
  const textures = images.map((img) => new ImageTexture(gl, img.src))
  let activeImage = 2

  const program = new Program(gl)
  program.attach(mainVertSrc, mainFragSrc)
  program.activate()

  uniforms.init(program.glProgram)

  const plane = new CanvasCoverPolygon(gl)
  plane.setLocations({ vertices: 0, uv: 1 })

  gl.clearColor(1.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  return {
    preload: [...textures.map((tex) => tex.load())],
    preloaded: [() => fitImage(textures[activeImage].img)],

    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      plane.bind()
      textures[activeImage].activate(program.glProgram!, "uOriginal")
      uniforms.float("uAlpha", uAlpha)
      uniforms.float("uMixingRatio", uMixingRatio)
      uniforms.float("uSiteCount", uSiteCount)
      plane.draw({ primitive: "TRIANGLES" })
    },

    control(ui) {
      ui.select("Image", images[activeImage].name, imageNames, (name) => {
        const idx = imageNames.indexOf(name)
        if (idx < 0) return
        activeImage = idx
        fitImage(textures[activeImage].img)
      })
      ui.number("全体の透明度", uAlpha, 0.0, 1.0, 0.01, (v) => {
        uAlpha = v
      })
      ui.number("ノイズの透明度", uMixingRatio, 0.0, 1.0, 0.01, (v) => {
        uMixingRatio = v
      })
      ui.number("広がり", uSiteCount, 3, 100, 1, (v) => {
        uSiteCount = v
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
