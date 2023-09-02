import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { ImageCanvas } from "sketchgl/texture"
import { ImageInterleavedData } from "sketchgl/utility"
import { SwapTFRenderer } from "sketchgl/renderer"
import { Uniforms } from "sketchgl/program"
import { Matrix4, Vector3 } from "sketchgl/math"
import { SpreadTextureInteraction } from "@/lib/feature/particle/spread-texture"
import { Timer } from "sketchgl/interactive"

import vertForUpdate from "./update.vert?raw"
import fragForUpdate from "./update.frag?raw"

import vertForRender from "./render.vert?raw"
import fragForRender from "./render.frag?raw"

import image from "@/assets/542x542/waterpaint-pink-purple.png"

const sketch: SketchFn = ({ gl, canvas }) => {
  const uniformsFor = {
    update: new Uniforms(gl, ["uTime", "uMouse", "uMove"]),
    render: new Uniforms(gl, ["uMatrix", "uMove"])
  }

  const matV = Matrix4.view(new Vector3(0, 0, 3), new Vector3(0, 0, 0), new Vector3(0, 1, 0))
  const matP = Matrix4.perspective(45, canvas.width / canvas.height, 0.1, 10)
  const matVP = matP.multiply(matV)

  const imgCvs = new ImageCanvas(image, 542, 542)

  const interleave = new ImageInterleavedData(imgCvs, ["vVertexPosition", "vVelocity", "vVertexColor"])

  interleave.useImageColorAs("vVertexColor")

  // TODO: 第二引数は { components: 3, generator: () => [] } という形で指定したい
  interleave.add("vVertexPosition", 3, ({ position }) => {
    const { x, y } = position
    return [x, -y, 0]
  })

  interleave.add("vVelocity", 3, ({ position }) => {
    const { x, y } = position
    const m = Math.sqrt(x * x + y * y)
    return [x / m, -y / m, 0]
  })

  const renderer = new SwapTFRenderer(gl, interleave.keys)

  renderer.attachUpdateProgram(vertForUpdate, fragForUpdate)
  renderer.attachRenderProgram(vertForRender, fragForRender)

  renderer.registUpdateAttrib("vVertexPosition", { location: 0, components: 3 })
  renderer.registUpdateAttrib("vVelocity", { location: 1, components: 3 })
  renderer.registUpdateAttrib("vVertexColor", { location: 2, components: 4 })

  renderer.registRenderAttrib("aVertexPosition", { location: 0, components: 3 })
  renderer.registRenderAttrib("aVelocity", { location: 1, components: 3 })
  renderer.registRenderAttrib("aVertexColor", { location: 2, components: 4 })

  uniformsFor.update.init(renderer.glProgramForUpdate)
  uniformsFor.render.init(renderer.glProgramForRender)

  // TODO: これもライブラリ側で大枠を提供したい
  const camera = new SpreadTextureInteraction(canvas)

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

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      renderer.startUpdate()
      uniformsFor.update.float("uTime", timer.elapsed * 0.001)
      uniformsFor.update.float("uMove", camera.movePower)
      uniformsFor.update.fvector2("uMouse", camera.mouseCoords)
      gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)
      renderer.endUpdate()

      renderer.startRender()
      uniformsFor.render.fmatrix4("uMatrix", matVP.values)
      uniformsFor.render.float("uMove", camera.movePower)
      gl.drawArrays(gl.POINTS, 0, imgCvs.width * imgCvs.height)
      renderer.endRender()
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fit: "square",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
