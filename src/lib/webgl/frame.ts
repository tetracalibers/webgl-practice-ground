// 参考：https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/PostProcess.js

import { Program } from "./program"
import type { Attribute, Uniform } from "./shader-data.type"

export class Frame {
  private _gl: WebGL2RenderingContext
  private _canvas: HTMLCanvasElement
  private _texture: WebGLTexture | null
  private _renderBuffer: WebGLRenderbuffer | null
  private _frameBuffer: WebGLFramebuffer | null
  private _vertexBuffer: WebGLBuffer | null
  private _textureBuffer: WebGLBuffer | null
  private _program: Program
  private _textureUnit: number

  constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    srcVertexShader: string,
    srcFragmentShader: string,
    textureUnit = 0
  ) {
    this._gl = gl
    this._canvas = canvas
    this._renderBuffer = null
    this._frameBuffer = null
    this._texture = null
    this._vertexBuffer = null
    this._textureBuffer = null
    this._program = new Program(gl, srcVertexShader, srcFragmentShader, false)
    this._textureUnit = textureUnit

    this.configureFramebuffer()
    this.configureGeometry()
    this.configureProgram()
  }

  private configureFramebuffer() {
    const gl = this._gl
    const { width, height } = this._canvas

    // Init Color Texture
    this._texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Init Renderbuffer
    this._renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // Init Framebuffer
    this._frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer)

    // Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private configureGeometry() {
    const gl = this._gl

    // Define the geometry for the full-screen quad
    const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    const textureCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]

    // Init the buffers
    this._vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    this._textureBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._textureBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

    // Clean up
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
  }

  private configureProgram() {
    const attributes: Attribute[] = ["aVertexTextureCoords", "aVertexPosition"]
    const uniforms: Uniform[] = [`uTexture${this._textureUnit}`]

    this._program.setAttributeLocations(attributes)
    this._program.setUniformLocations(uniforms)
  }

  resize() {
    const gl = this._gl
    const { width, height } = this._canvas

    // 1. Resize Color Texture
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 2. Resize Render Buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // 3. Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  }

  bind() {
    const gl = this._gl

    this._program.useProgram()

    const aVertexPosition = this._program.getAttributeLocation("aVertexPosition")
    const aVertexTexCoord = this._program.getAttributeLocation("aVertexTextureCoords")
    const uTexture = this._program.getUniformLocation("uTexture")

    // Bind the quad geometry
    gl.enableVertexAttribArray(aVertexPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(aVertexTexCoord)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._textureBuffer)
    gl.vertexAttribPointer(aVertexTexCoord, 2, gl.FLOAT, false, 0, 0)

    // Bind the texture from the framebuffer
    gl.activeTexture(gl.TEXTURE0 + this._textureUnit)
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.uniform1i(uTexture, this._textureUnit)
  }

  draw() {
    const gl = this._gl
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  get frameBuffer() {
    return this._frameBuffer
  }

  get framebuffer() {
    return this._frameBuffer
  }

  get texture() {
    return this._texture
  }

  get program() {
    return this._program
  }
}
