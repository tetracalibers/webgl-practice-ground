type MIN_FILTER =
  | "NEAREST"
  | "LINEAR"
  | "NEAREST_MIPMAP_NEAREST"
  | "NEAREST_MIPMAP_LINEAR"
  | "LINEAR_MIPMAP_NEAREST"
  | "LINEAR_MIPMAP_LINEAR"
type MAG_FILTER = "NEAREST" | "LINEAR"
type WRAP = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT"

const getObjectKeys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj)
}

export class ImageTexture {
  private _gl: WebGL2RenderingContext
  private _image: HTMLImageElement
  private _texture: WebGLTexture | null = null
  private _params: {
    TEXTURE_MAG_FILTER?: MAG_FILTER
    TEXTURE_MIN_FILTER?: MIN_FILTER
    TEXTURE_WRAP_S?: WRAP
    TEXTURE_WRAP_T?: WRAP
  } = {}

  constructor(gl: WebGL2RenderingContext, src: string) {
    this._gl = gl
    this._image = new Image()
    this._image.src = src
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
    getObjectKeys(this._params).forEach((key) => {
      const value = this._params[key]
      value && gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[value])
    })
    // テクスチャのバインドを無効化
    gl.bindTexture(gl.TEXTURE_2D, null)
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

  activate(program: WebGLProgram, name: string, unit = 0) {
    const gl = this._gl
    const location = gl.getUniformLocation(program, name)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.uniform1i(location, unit)
  }

  set MAG_FILTER(value: MAG_FILTER) {
    this._params.TEXTURE_MAG_FILTER = value
  }

  set MIN_FILTER(value: MIN_FILTER) {
    this._params.TEXTURE_MIN_FILTER = value
  }

  set WRAP_S(value: WRAP) {
    this._params.TEXTURE_WRAP_S = value
  }

  set WRAP_T(value: WRAP) {
    this._params.TEXTURE_WRAP_T = value
  }
}
