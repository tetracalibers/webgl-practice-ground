import type { Program } from "./program"
import type { Uniform2fv } from "./shader-data.type"

export class UniformReflect {
  private _gl: WebGL2RenderingContext
  private _program: Program

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program
  }

  floatVector2(uniform: Uniform2fv, value: [number, number]) {
    this._gl.uniform2fv(this._program.getUniformLocation(uniform), value)
  }

  resolution() {
    this.floatVector2("uResolution", [this._gl.canvas.width, this._gl.canvas.height])
  }
}
