import type { Program } from "./program"
import type { Uniform1f, Uniform2fv } from "./shader-data.type"

export class UniformReflect {
  private _gl: WebGL2RenderingContext
  private _program: Program

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program
  }

  float(uniform: Uniform1f, value: number) {
    this._gl.uniform1f(this._program.getUniformLocation(uniform), value)
  }

  floatVector2(uniform: Uniform2fv, value: [number, number]) {
    this._gl.uniform2fv(this._program.getUniformLocation(uniform), value)
  }

  resolution() {
    this.floatVector2("uResolution", [this._gl.canvas.width, this._gl.canvas.height])
  }

  time(time: number) {
    // ミリ秒単位の時間をそのまま渡すと非常に大きな数字になってしまうため、
    // 千分の一にしてシェーダに送る
    const v = time * 0.001
    this.float("uTime", v)
  }
}
