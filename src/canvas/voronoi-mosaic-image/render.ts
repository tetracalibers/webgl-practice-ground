import { SketchFilter, type FilterSketchConfig, type FilterSketchFn } from "sketchgl"
import { ImageTexture } from "sketchgl/texture"
import { Program, Uniforms } from "sketchgl/program"
import { CanvasCoverPolygon, InstancedGeometry } from "sketchgl/geometry"
import { Vector2 } from "sketchgl/math"
import { OffscreenRenderer } from "sketchgl/renderer"

import mainVertSrc from "./index.vert?raw"
import mainFragSrc from "./index.frag"

import voronoiVertSrc from "./voronoi.vert?raw"
import voronoiFragSrc from "./voronoi.frag"

import imageGeometry from "@/assets/original/fantasy-unicorn.jpg"
import imageAutumnLeaves from "@/assets/original/autumn-leaves_00037.jpg"
import imageWater from "@/assets/original/trii.jpg"
import imageGoldFish from "@/assets/original/fireworks_00018.jpg"

const count = 2000
const resolution = 64

const generateConeVertex = (canvas: HTMLCanvasElement) => {
  const w = canvas.width
  const h = canvas.height
  const a = new Vector2(w, h).normalize()

  let cone = [0, 0, -0.95]

  for (let i = 0; i < resolution; i++) {
    const v = (i / (resolution - 1)) * Math.PI * 2
    cone.push(Math.cos(v) * a.y * 2)
    cone.push(Math.sin(v) * a.x * 2)
    cone.push(1.0)
  }

  return cone
}

const generatePoints = (count: number) => {
  const points = []

  for (let i = 0; i < count; i++) {
    points.push(Math.random(), Math.random())
  }

  return points
}

const sketch: FilterSketchFn = ({ gl, fitImage, canvas }) => {
  const uniforms = new Uniforms(gl, ["uMixingRatio"])
  let uMixingRatio = 0.5

  const images = [
    { name: "花火", src: imageGoldFish },
    { name: "ユニコーン", src: imageGeometry },
    { name: "紅葉", src: imageAutumnLeaves },
    { name: "鳥居", src: imageWater }
  ]
  const imageNames = images.map((obj) => obj.name)
  const textures = images.map((img) => new ImageTexture(gl, img.src))
  let activeImage = 2

  const cone = new InstancedGeometry(gl)
  const plane = new CanvasCoverPolygon(gl)
  plane.setLocations({ vertices: 0, uv: 1 })

  const renderer = new OffscreenRenderer(gl, canvas, voronoiVertSrc, voronoiFragSrc, { texUnitStart: 1 })

  const program = new Program(gl)
  program.attach(mainVertSrc, mainFragSrc)

  uniforms.init(program.glProgram)

  gl.clearColor(1.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  return {
    resize: [renderer.resize],

    preload: [...textures.map((tex) => tex.load())],
    preloaded: [
      () => {
        fitImage(textures[activeImage].img)

        cone.registAttrib("vertice", {
          location: 0,
          components: 3,
          buffer: new Float32Array(generateConeVertex(canvas)),
          divisor: 0
        })
        cone.registAttrib("offset", {
          location: 1,
          components: 2,
          buffer: new Float32Array(generatePoints(count)),
          divisor: 1
        })
        cone.setup()
      }
    ],

    drawOnFrame() {
      renderer.switchToOffcanvas()
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      cone.bind()
      cone.draw({ primitive: "TRIANGLE_FAN", instanceCount: count })

      renderer.switchToCanvas(program)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      plane.bind()
      uniforms.float("uMixingRatio", uMixingRatio)
      textures[activeImage].activate(program.glProgram, "uOriginal")
      renderer.useAsTexture("uVoronoi", program.glProgram)
      plane.draw({ primitive: "TRIANGLES" })
    },

    control(ui) {
      ui.select("Image", images[activeImage].name, imageNames, (name) => {
        const idx = imageNames.indexOf(name)
        if (idx < 0) return
        activeImage = idx
        fitImage(textures[activeImage].img)
      })
      ui.number("ボロノイの透明度", uMixingRatio, 0.0, 1.0, 0.01, (v) => {
        uMixingRatio = v
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
