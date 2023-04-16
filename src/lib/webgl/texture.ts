import type { Program } from "./program"
import type { TextureParamsManager } from "./texture-params-manager"

export class Texture {
  private _gl: WebGL2RenderingContext
  private _image: HTMLImageElement
  private _texture: WebGLTexture | null = null
  private _program: Program
  private _unit: number
  private _params: TextureParamsManager | null = null

  constructor(
    gl: WebGL2RenderingContext,
    program: Program,
    src: string,
    unit = 0,
    config: TextureParamsManager | null = null
  ) {
    this._gl = gl
    this._program = program
    this._unit = unit
    this._params = config

    this._image = new Image()
    this._image.src = src

    program.setUniformLocations([`uTexture${unit}`])
  }

  load() {
    return new Promise<WebGLTexture | null>((resolve, reject) => {
      this._image.onload = () => {
        this.makeTexture()
        resolve(this._texture)
      }
      this._image.onerror = () => {
        reject()
      }
    })
  }

  private makeTexture() {
    const gl = this._gl
    this._texture = gl.createTexture()
    // テクスチャをバインドする
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    // テクスチャ転送時のY座標設定を反転しておく
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // テクスチャへイメージを適用
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image)
    // ミップマップを生成
    gl.generateMipmap(gl.TEXTURE_2D)
    // テクスチャパラメータの設定
    this._params && this._params.bind()
    // テクスチャのバインドを無効化
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  set src(path: string) {
    this._image.src = path
  }

  get() {
    return this._texture
  }

  use() {
    const gl = this._gl
    const unit = this._unit
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.uniform1i(this._program.getUniformLocation(`uTexture${unit}`), unit)
  }
}
