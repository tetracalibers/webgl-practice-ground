import { Program } from "@/lib/webgl/program"
import fragShaderSource from "./scale.frag?raw"
import vertShaderSource from "./scale.vert?raw"

export class ReduceFrame {
  private _gl: WebGL2RenderingContext
  private _texture: WebGLTexture | null
  private _framebuffer: WebGLFramebuffer | null
  private _vertexBuffer: WebGLBuffer | null
  private _textureBuffer: WebGLBuffer | null
  private _program: Program
  private _textureUnit: number
  private _width: number
  private _height: number

  constructor(gl: WebGL2RenderingContext, rate: number, textureUnit = 0) {
    this._gl = gl
    this._textureUnit = textureUnit

    const size = this.calcOffcanvasSize(rate)
    this._width = size
    this._height = size

    const { texture, framebuffer } = this.createFramebuffer(gl)
    const { vertexBuffer, textureBuffer } = this.createGeometry(gl)
    const program = this.createProgram(gl)

    this._texture = texture
    this._framebuffer = framebuffer
    this._vertexBuffer = vertexBuffer
    this._textureBuffer = textureBuffer
    this._program = program
  }

  private createFramebuffer(gl: WebGL2RenderingContext, mode: "NEAREST" | "LINEAR" = "NEAREST") {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[mode])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[mode])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return { texture, framebuffer }
  }

  private createGeometry(gl: WebGL2RenderingContext) {
    const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    const textureCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    const textureBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return { vertexBuffer, textureBuffer }
  }

  private createProgram(gl: WebGL2RenderingContext) {
    const program = new Program(gl, vertShaderSource, fragShaderSource, false)
    program.setAttributeLocations(["aVertexTextureCoords", "aVertexPosition"])
    program.setUniformLocations(["uTexture"])

    return program
  }

  private calcOffcanvasSize(rate: number) {
    const canvas = this._gl.canvas
    const size = Math.min(canvas.width, canvas.height)
    const step = Math.ceil(size / rate)
    const step5multipl = Math.round(step / 5) * 5 // 最も近い5の倍数
    return step5multipl
  }

  bind() {
    const gl = this._gl

    this._program.use()

    const aVertexPosition = this._program.getAttributeLocation("aVertexPosition")
    const aVertexTexCoord = this._program.getAttributeLocation("aVertexTextureCoords")
    const uTexture = this._program.getUniformLocation("uTexture")

    gl.enableVertexAttribArray(aVertexPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(aVertexTexCoord)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._textureBuffer)
    gl.vertexAttribPointer(aVertexTexCoord, 2, gl.FLOAT, false, 0, 0)

    gl.activeTexture(gl.TEXTURE0 + this._textureUnit)
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.uniform1i(uTexture, this._textureUnit)
  }

  switchToOffcanvas() {
    const gl = this._gl
    gl.viewport(0, 0, this._width, this._height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  switchToCanvas() {
    const gl = this._gl
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  draw() {
    const gl = this._gl
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  changeRate(rate: number) {
    const gl = this._gl

    const size = this.calcOffcanvasSize(rate)
    this._width = size
    this._height = size

    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }
}
