import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { Uniforms } from "sketchgl/program"
import { ImageCanvas } from "sketchgl/texture"
import { ImageInterleavedData } from "sketchgl/utility"
import { Timer } from "sketchgl/interactive"
import { SwapTFRenderer } from "sketchgl/renderer"
import { WaveParticleCamera } from "@/lib/feature/particle/wave-particle-camera"

import vertForOut from "./out.vert?raw"
import fragForOut from "./out.frag?raw"

import vertForIn from "./in.vert?raw"
import fragForIn from "./in.frag?raw"

import image from "@/assets/542x542/waterpaint-pink-purple.png"

const sketch: SketchFn = ({ gl, canvas }) => {
  const uniformsFor = {
    update: new Uniforms(gl, ["uTime", "uMouse"]),
    render: new Uniforms(gl, ["uMatrix"])
  }

  const imgCvs = new ImageCanvas(image, 542, 542)
  const interleave = new ImageInterleavedData(imgCvs, ["vVertexPosition", "vVertexColor"])

  interleave.add("vVertexPosition", {
    components: 4,
    generate: ({ position }) => {
      const { x, y } = position
      return [x, -y, 0, 1]
    }
  })
  interleave.useImageColorAs("vVertexColor")

  const renderer = new SwapTFRenderer(gl, interleave.keys)

  renderer.attachUpdateProgram(vertForOut, fragForOut)
  renderer.attachRenderProgram(vertForIn, fragForIn)

  renderer.registUpdateAttrib("vVertexPosition", { location: 0, components: 4 })
  renderer.registUpdateAttrib("vVertexColor", { location: 1, components: 4 })

  renderer.registRenderAttrib("aVertexPosition", { location: 0, components: 4 })
  renderer.registRenderAttrib("aVertexColor", { location: 1, components: 4 })

  uniformsFor.update.init(renderer.glProgramForUpdate)
  uniformsFor.render.init(renderer.glProgramForRender)

  // TODO: ライブラリでうまいこと提供する
  const camera = new WaveParticleCamera(canvas, 0.5)

  const timer = new Timer()
  timer.start()

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.BLEND)
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
  gl.disable(gl.RASTERIZER_DISCARD)

  return {
    preload: [imgCvs.load()],

    preloaded: [
      () => {
        const interleavedArray = interleave.generate()
        renderer.setup(new Float32Array(interleavedArray))
      }
    ],

    drawOnFrame() {
      camera.update()

      renderer.startUpdate()

      uniformsFor.update.float("uTime", timer.elapsed * 0.001)
      uniformsFor.update.fvector2("uMouse", camera.mouseCoords)

      gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)

      renderer.endUpdate()

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      renderer.startRender()

      uniformsFor.render.fmatrix4("uMatrix", camera.matrix.values)

      gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)

      renderer.endRender()
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fit: "screen",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
