export class ShaderCompiler {
  private _gl: WebGL2RenderingContext

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl
  }

  compileVertexShader(shaderSource: string) {
    const shader = this._gl.createShader(this._gl.VERTEX_SHADER)
    if (!shader) return null
    this.compile(shader, shaderSource)
    return shader
  }

  compileFragmentShader(shaderSource: string) {
    const shader = this._gl.createShader(this._gl.FRAGMENT_SHADER)
    if (!shader) return null
    this.compile(shader, shaderSource)
    return shader
  }

  compile(shader: WebGLShader, shaderSource: string) {
    // 与えられたシェーダーコードを使用してシェーダーをコンパイル
    this._gl.shaderSource(shader, shaderSource)
    this._gl.compileShader(shader)

    // シェーダーに問題がないことを確認
    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      console.error(this._gl.getShaderInfoLog(shader))
      this._gl.deleteShader(shader)
    }
  }
}
