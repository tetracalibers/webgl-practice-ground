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
  private _program: Program<Attribute, T>

  constructor(gl: WebGL2RenderingContext, program: Program<any, any>, uniforms: T[]) {
    this._gl = gl
    this._program = program
    this._program.setUniformLocations(uniforms)
  }

  location(name: T) {
    return this._program.getUniformLocation(name)
  }

  boolean(name: T, value: boolean) {
    this._gl.uniform1i(this.location(name), value ? 1 : 0)
  }
}
