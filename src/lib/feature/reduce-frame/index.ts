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
    const size = Math.min(gl.canvas.width, gl.canvas.height)
    const step = Math.ceil(size / rate)
    const step5 = Math.round(step / 5) * 5
    this._width = step5
    this._height = step5
    this._textureUnit = textureUnit

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

    //const renderBuffer = gl.createRenderbuffer()
    //gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._width, this._height)

    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    //gl.bindRenderbuffer(gl.RENDERBUFFER, null)

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
    program.setUniformLocations([`uTexture${this._textureUnit}`])

    return program
  }

  bind() {
    const gl = this._gl

    this._program.use()

    const aVertexPosition = this._program.getAttributeLocation("aVertexPosition")
    const aVertexTexCoord = this._program.getAttributeLocation("aVertexTextureCoords")
    const uTexture = this._program.getUniformLocation(`uTexture${this._textureUnit}`)

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

  drawShrink() {
    const gl = this._gl
    gl.viewport(0, 0, this._width, this._height)
    //gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  drawExpand() {
    const gl = this._gl

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  changeRate(rate: number) {
    const gl = this._gl
    const size = Math.min(gl.canvas.width, gl.canvas.height)
    const step = Math.ceil(size / rate)
    const step5 = Math.round(step / 5) * 5
    this._width = step5
    this._height = step5

    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  get program() {
    return this._program
  }

  get shaderSource() {
    return { vert: vertShaderSource, frag: fragShaderSource }
  }

  get framebuffer() {
    return this._framebuffer
  }
}
