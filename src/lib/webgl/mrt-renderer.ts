import { Program } from "./gl-program"

interface Options {
  texCount: number
  texUnitStart?: number
}

export class MrtRenderer {
  private _gl: WebGL2RenderingContext
  private _canvas: HTMLCanvasElement
  private _textures: (WebGLTexture | null)[] = []
  private _renderBuffer: WebGLRenderbuffer | null = null
  private _frameBuffer: WebGLFramebuffer | null = null
  private _program: Program
  private _texCount: number
  private _texUnitStart: number

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, vert: string, frag: string, options: Options) {
    this._gl = gl
    this._canvas = canvas
    this._texCount = options.texCount
    this._texUnitStart = options.texUnitStart ?? 0

    this._program = new Program(gl)
    this._program.attach(vert, frag)

    this.configureFramebuffer()
    this.bindTextures()
  }

  private configureFramebuffer() {
    const gl = this._gl
    const { width, height } = this._canvas

    // Init Framebuffer
    this._frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer)

    for (let i = 0; i < this._texCount; i++) {
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
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer)

    const bufferList = this._textures.map((_, i) => gl.COLOR_ATTACHMENT0 + i)
    gl.drawBuffers(bufferList)

    // Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  resize() {
    const gl = this._gl
    const { width, height } = this._canvas

    for (let i = 0; i < this._texCount; i++) {
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

  private bindTextures() {
    const gl = this._gl
    // Bind the texture from the framebuffer
    for (let i = 0; i < this._texCount; i++) {
      gl.activeTexture(gl.TEXTURE0 + this._texUnitStart + i)
      gl.bindTexture(gl.TEXTURE_2D, this._textures[i])
    }
  }

  useTextureOf(idx: number, name: string, program: WebGLProgram | null) {
    if (!program) return

    const gl = this._gl
    const location = gl.getUniformLocation(program, name)

    gl.activeTexture(gl.TEXTURE0 + this._texUnitStart + idx)
    gl.bindTexture(gl.TEXTURE_2D, this._textures[idx])
    gl.uniform1i(location, this._texUnitStart + idx)
  }

  switchToOffcanvas() {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer)
    this._program.activate()
  }

  switchToCanvas(program: Program) {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    program.activate()
  }

  get program() {
    return this._program
  }
}
