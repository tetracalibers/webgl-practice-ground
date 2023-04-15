import { Matrix4 } from "../math/matrix"
import type { Program } from "./program"

export class Light {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _direction: [number, number, number] = [0, 0, 0]
  private _invModelMatrix: Matrix4 = Matrix4.identity()

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations(["uLightDirection", "uInvModelMatrix"])
  }

  set direction(direction: [number, number, number]) {
    this._direction = direction
  }

  set model(model: Matrix4) {
    this._invModelMatrix = model.inverse()
  }

  reflect() {
    const uLightDirection = this._program.getUniformLocation("uLightDirection")
    const uInvModelMatrix = this._program.getUniformLocation("uInvModelMatrix")

    this._gl.uniform3fv(uLightDirection, this._direction)
    this._gl.uniformMatrix4fv(uInvModelMatrix, false, this._invModelMatrix.values)
  }
}
