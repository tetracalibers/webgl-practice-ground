import { Frame } from "@/lib/webgl/frame"
import { Program } from "@/lib/webgl/program"
import { MouseCoords } from "@/lib/control/mouse-coords"
import type { Attribute, Uniform } from "@/lib/webgl/shader-data.type"
import { Timer } from "@/lib/control/timer"

import offscreenVertexSrc from "./offscreen.vert?raw"
import prevFragmentSrc from "./prev.frag?raw"
import compositeFragmentSrc from "./composite.frag?raw"

class MainProgram extends Program<Attribute, Uniform | "uPrevTexture" | "uCurrTexture"> {}

export class Afterimage {
  private _gl: WebGL2RenderingContext

  private _prevCapture: Frame
  private _currCapture: Frame

  private _mainProgram: MainProgram

  private _mouse: MouseCoords
  private _timer: Timer

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, vertexSrc: string, fragmentSrc: string) {
    this._gl = gl

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    this._prevCapture = new Frame(gl, canvas, offscreenVertexSrc, prevFragmentSrc, 0)
    this._currCapture = new Frame(gl, canvas, offscreenVertexSrc, fragmentSrc, 1)

    const uniforms: Uniform[] = ["uMouse", "uResolution", "uTime"]
    this._mouse = new MouseCoords(canvas)
    this._timer = new Timer()

    this._currCapture.program.setUniformLocations(uniforms)

    this._mainProgram = new MainProgram(gl, vertexSrc, compositeFragmentSrc, false)
    this._mainProgram.setUniformLocations([...uniforms, "uPrevTexture", "uCurrTexture"])

    this._timer.start()
  }

  resize() {
    this._prevCapture.resize()
    this._currCapture.resize()
  }

  private setStateUniforms(program: Program) {
    const gl = this._gl

    const uResolution = program.getUniformLocation("uResolution")
    const uMouse = program.getUniformLocation("uMouse")
    const uTime = program.getUniformLocation("uTime")

    gl.uniform2fv(uResolution, [gl.canvas.width, gl.canvas.height])
    gl.uniform2fv(uMouse, this._mouse.xy)
    gl.uniform1f(uTime, this._timer.elapsed * 0.001)
  }

  private setTextureUniforms(program: MainProgram) {
    const gl = this._gl

    const uPrevTexture = program.getUniformLocation("uPrevTexture")
    const uCurrTexture = program.getUniformLocation("uCurrTexture")

    gl.uniform1i(uPrevTexture, 0)
    gl.uniform1i(uCurrTexture, 1)
  }

  private drawToCanvas() {
    const gl = this._gl

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this._mainProgram.use()
    this.setStateUniforms(this._mainProgram)
    this.setTextureUniforms(this._mainProgram)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3)
  }

  draw() {
    const gl = this._gl

    // draw current capture to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._currCapture.frameBuffer)
    this._currCapture.bind()
    this.setStateUniforms(this._currCapture.program)
    this._currCapture.draw()

    // draw previous capture to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._prevCapture.frameBuffer)
    this._prevCapture.bind()
    gl.bindTexture(gl.TEXTURE_2D, null)
    this._prevCapture.draw()

    // draw texture of framebuffer to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    this.drawToCanvas()
  }
}
