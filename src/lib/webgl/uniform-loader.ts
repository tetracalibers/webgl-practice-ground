import type { Program } from "./program"
import type { Attribute } from "./shader-data.type"

type UpperABC =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
type CustomUniform = `u${UpperABC}${string}`

export class UniformLoader<T extends CustomUniform> {
  private _gl: WebGL2RenderingContext
  private _program: Program<Attribute, T> | null = null
  private _uniforms: T[]

  constructor(gl: WebGL2RenderingContext, uniforms: T[]) {
    this._gl = gl
    this._uniforms = uniforms
  }

  init(program: Program<any, any>) {
    this._program = program
    this._program.setUniformLocations(this._uniforms)
  }

  location(name: T) {
    return this._program?.getUniformLocation(name)
  }

  boolean(name: T, value: boolean) {
    const loc = this.location(name)
    loc && this._gl.uniform1i(loc, value ? 1 : 0)
  }

  float(name: T, value: number) {
    const loc = this.location(name)
    loc && this._gl.uniform1f(loc, value)
  }

  int(name: T, value: number) {
    const loc = this.location(name)
    loc && this._gl.uniform1i(loc, value)
  }

  fvector1(name: T, value: number[]) {
    const loc = this.location(name)
    loc && this._gl.uniform1fv(loc, value)
  }
}
