export class UniformManager {
  private _gl: WebGL2RenderingContext
  private _program: WebGLProgram
  private _uniforms: Record<string, any> = {}

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this._gl = gl
    this._program = program
  }

  init(names: string[]) {
    for (const name of names) {
      this._uniforms[name] = this._gl.getUniformLocation(this._program, name)
    }
  }

  boolean(name: string, value: boolean) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform1i(loc, value ? 1 : 0)
  }

  float(name: string, value: number) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform1f(loc, value)
  }

  int(name: string, value: number) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform1i(loc, value)
  }

  fvector1(name: string, value: number[]) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform1fv(loc, value)
  }

  fvector2(name: string, value: number[]) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform2fv(loc, value)
  }

  fvector3(name: string, value: number[]) {
    const loc = this._uniforms[name]
    loc && this._gl.uniform3fv(loc, value)
  }

  fmatrix4v(name: string, value: Float32Array) {
    const loc = this._uniforms[name]
    loc && this._gl.uniformMatrix4fv(loc, false, value)
  }
}
