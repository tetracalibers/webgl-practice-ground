/* Usage

  offcanvas.initSmallOffcanvas()
  program.use()
  
  scene.traverseDraw((obj) => {
    obj.bind()
    textures[activeImage].use()
    gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
    obj.cleanup()
  })
  
  offcanvas.drawToCanvas()

*/

export class ReduceFrameSimple {
  private _gl: WebGL2RenderingContext
  private _texture: WebGLTexture | null
  private _framebuffer: WebGLFramebuffer | null
  private _width: number
  private _height: number

  constructor(gl: WebGL2RenderingContext, rate: number) {
    this._gl = gl

    const size = this.calcOffcanvasSize(rate)
    this._width = size
    this._height = size

    const { texture, framebuffer } = this.createFramebuffer(gl)

    this._texture = texture
    this._framebuffer = framebuffer
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

  private calcOffcanvasSize(rate: number) {
    const canvas = this._gl.canvas
    const size = Math.min(canvas.width, canvas.height)
    const step = Math.ceil(size / rate)
    const step5multipl = Math.round(step / 5) * 5 // 最も近い5の倍数
    return step5multipl
  }

  initSmallOffcanvas() {
    const gl = this._gl
    gl.viewport(0, 0, this._width, this._height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  drawToCanvas() {
    const gl = this._gl

    // 読み込み先にテクスチャをアタッチしたフレームバッファーを指定
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer)
    // 書き込み先にnull（デフォルトのフレームバッファー）を指定
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)

    // 書き込み先フレームバッファーをクリア
    gl.clearBufferfv(gl.COLOR, 0, [0.9, 0.9, 0.9, 1.0])

    gl.blitFramebuffer(
      0,
      0,
      this._width,
      this._height,
      0,
      0,
      gl.canvas.width,
      gl.canvas.height,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST
    )
  }

  changeReduceRate(rate: number) {
    const gl = this._gl

    const size = this.calcOffcanvasSize(rate)
    this._width = size
    this._height = size

    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }
}
