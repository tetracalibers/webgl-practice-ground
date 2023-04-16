type MIN_FILTER =
  | "NEAREST"
  | "LINEAR"
  | "NEAREST_MIPMAP_NEAREST"
  | "NEAREST_MIPMAP_LINEAR"
  | "LINEAR_MIPMAP_NEAREST"
  | "LINEAR_MIPMAP_LINEAR"
type MAG_FILTER = "NEAREST" | "LINEAR"
type WRAP = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT"

export class TextureParamsManager {
  private _gl: WebGL2RenderingContext
  private _MIN_FILTER: MIN_FILTER | null = null
  private _MAG_FILTER: MAG_FILTER | null = null
  private _WRAP_S: WRAP | null = null
  private _WRAP_T: WRAP | null = null

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl
  }

  set MIN_FILTER(kind: MIN_FILTER) {
    this._MIN_FILTER = kind
  }

  set MAG_FILTER(kind: MAG_FILTER) {
    this._MAG_FILTER = kind
  }

  set WRAP_S(kind: WRAP) {
    this._WRAP_S = kind
  }

  set WRAP_T(kind: WRAP) {
    this._WRAP_T = kind
  }

  bind() {
    const gl = this._gl

    if (this._MIN_FILTER) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this._MIN_FILTER])
    }
    if (this._MAG_FILTER) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this._MAG_FILTER])
    }
    if (this._WRAP_S) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this._WRAP_S])
    }
    if (this._WRAP_T) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this._WRAP_T])
    }
  }
}
