const keys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj)
}

type LocationMap<T extends string> = Record<T, WebGLUniformLocation>

export class Uniforms<T extends string> {
  private _gl: WebGL2RenderingContext
  private _locations: LocationMap<T>

  constructor(gl: WebGL2RenderingContext, names: T[]) {
    this._gl = gl
    this._locations = names.reduce<LocationMap<T>>((acc, name) => ({ ...acc, [name]: -1 }), <LocationMap<T>>{})
  }

  init(program: WebGLProgram | null) {
    if (!program) return
    for (const name of keys(this._locations)) {
      this._locations[name] = this._gl.getUniformLocation(program, name) ?? -1
    }
  }

  bool(name: T, value: boolean) {
    const loc = this._locations[name]
    loc && this._gl.uniform1i(loc, value ? 1 : 0)
  }

  float(name: T, value: number) {
    const loc = this._locations[name]
    loc && this._gl.uniform1f(loc, value)
  }

  int(name: T, value: number) {
    const loc = this._locations[name]
    loc && this._gl.uniform1i(loc, value)
  }

  fvector1(name: T, value: number[]) {
    const loc = this._locations[name]
    loc && this._gl.uniform1fv(loc, value)
  }

  fvector2(name: T, value: number[]) {
    const loc = this._locations[name]
    loc && this._gl.uniform2fv(loc, value)
  }

  fvector3(name: T, value: number[]) {
    const loc = this._locations[name]
    loc && this._gl.uniform3fv(loc, value)
  }

  fvector4(name: T, value: number[]) {
    const loc = this._locations[name]
    loc && this._gl.uniform4fv(loc, value)
  }

  fmatrix4(name: T, value: Float32Array) {
    const loc = this._locations[name]
    loc && this._gl.uniformMatrix4fv(loc, false, value)
  }
}
