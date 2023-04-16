import type { TextureParamsManager } from "./texture-params-manager"

export class OffscreenRenderer {
  private _gl: WebGL2RenderingContext
  private _canvas: HTMLCanvasElement
  private _texture: WebGLTexture | null
  private _frameBuffer: WebGLFramebuffer | null
  private _depthRenderBuffer: WebGLRenderbuffer | null

  constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    textureConfig: TextureParamsManager | null = null
  ) {
    this._gl = gl
    this._canvas = canvas

    const { width, height } = canvas

    // フレームバッファ用テクスチャの生成とバインド
    this._texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    // テクスチャパラメータの設定
    textureConfig && textureConfig.bind()
    // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 深度バッファ用レンダーバッファの生成とバインド
    this._depthRenderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRenderBuffer)
    // レンダーバッファを深度バッファとして設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // フレームバッファの生成とバインド
    this._frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer)
    // フレームバッファにレンダーバッファを関連付ける
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRenderBuffer)
    // フレームバッファにテクスチャを関連付ける
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0)

    // 各種オブジェクトのバインドを解除
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  resize() {
    const { width, height } = this._canvas
    const gl = this._gl

    // 1. Resize Color Texture
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 2. Resize Render Buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // 3. Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  }

  useAsTexture() {
    const gl = this._gl
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
  }

  get frameBuffer() {
    return this._frameBuffer
  }

  get texture() {
    return this._texture
  }
}
