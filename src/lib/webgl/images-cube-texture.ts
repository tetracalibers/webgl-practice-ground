const keys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj)
}

type CubeSurface = "top" | "bottom" | "left" | "right" | "front" | "back"

type CubeSurfaceImages = Record<CubeSurface, HTMLImageElement>

export class ImagesCubeTexture {
  private _gl: WebGL2RenderingContext
  private _images: CubeSurfaceImages
  private _texCubeMap: WebGLTexture | null = null

  constructor(gl: WebGL2RenderingContext, srcRecord: Record<CubeSurface, string>) {
    this._gl = gl

    this._images = keys(srcRecord).reduce<CubeSurfaceImages>((acc, name) => {
      const img = new Image()
      img.src = srcRecord[name]
      return { ...acc, [name]: img }
    }, <CubeSurfaceImages>{})
  }

  async setup() {
    const images = this._images

    const promises = keys(images).map((name) => {
      return new Promise<void>((resolve) => {
        images[name].onload = () => resolve()
      })
    })

    return Promise.all(promises).then(() => {
      this.generateCubeMap()
    })
  }

  private generateCubeMap() {
    const gl = this._gl

    // テクスチャオブジェクトの生成
    const texture = gl.createTexture()
    // テクスチャをキューブマップとしてバインドする
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)

    // テクスチャへイメージを適用
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.right)
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.left)
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.top)
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.bottom)
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.front)
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._images.back)

    // ミップマップを生成
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP)

    // テクスチャパラメータの設定
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    this._texCubeMap = texture

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
  }

  activate(program: WebGLProgram | null, name: string, unit = 0) {
    const gl = this._gl
    if (!program) return

    const location = gl.getUniformLocation(program, name)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._texCubeMap)
    gl.uniform1i(location, unit)
  }
}
