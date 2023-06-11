// 参考：https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/PostProcess.js

import { Program } from "./program"
import type { Attribute } from "./shader-data.type"

export class FrameMRT {
  private _gl: WebGL2RenderingContext
  private _canvas: HTMLCanvasElement
  private _textures: (WebGLTexture | null)[]
  private _renderBuffer: WebGLRenderbuffer | null
  private _frameBuffer: WebGLFramebuffer | null
  private _vertexBuffer: WebGLBuffer | null
  private _textureBuffer: WebGLBuffer | null
  private _program: Program<any, any>
  private _count: number
  private _textureUnitStart: number

  constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    srcVertexShader: string,
    srcFragmentShader: string,
    count: number,
    textureUnitStart = 0
  ) {
    this._gl = gl
    this._canvas = canvas
    this._renderBuffer = null
    this._frameBuffer = null
    this._textures = []
    this._vertexBuffer = null
    this._textureBuffer = null
    this._program = new Program(gl, srcVertexShader, srcFragmentShader, false)
    this._count = count
    this._textureUnitStart = textureUnitStart

    this.configureFramebuffer()
    this.configureGeometry()
    this.configureProgram()
  }

  private configureFramebuffer() {
    const gl = this._gl
    const { width, height } = this._canvas

    // Init Framebuffer
    this._frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer)

    for (let i = 0; i < this._count; i++) {
      // Init Color Texture
      this._textures[i] = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this._textures[i])
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this._textures[i], 0)
    }

    // Init Renderbuffer
    this._renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    const bufferList = this._textures.map((_, i) => gl.COLOR_ATTACHMENT0 + i)
    gl.drawBuffers(bufferList)

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
    const uniforms = this._textures.map((_, i) => `uTexture${this._textureUnitStart + i}`)

    this._program.setAttributeLocations(attributes)
    this._program.setUniformLocations(uniforms)
  }

  resize() {
    const gl = this._gl
    const { width, height } = this._canvas

    for (let i = 0; i < this._count; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this._textures[i])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

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
    for (let i = 0; i < this._count; i++) {
      gl.activeTexture(gl.TEXTURE0 + this._textureUnitStart + i)
      gl.bindTexture(gl.TEXTURE_2D, this._textures[i])
      gl.uniform1i(uTexture, this._textureUnitStart + i)
    }
  }

  useTextureOn(idx: number, name: string, program: Program<any, any>) {
    const gl = this._gl
    const location = program.getUniformLocation(name)

    gl.activeTexture(gl.TEXTURE0 + this._textureUnitStart + idx)
    gl.bindTexture(gl.TEXTURE_2D, this._textures[idx])
    gl.uniform1i(location, this._textureUnitStart + idx)
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

  get textures() {
    return this._textures
  }

  get program() {
    return this._program
  }
}
