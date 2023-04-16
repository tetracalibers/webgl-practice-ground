import { Matrix4 } from "../math/matrix"
import type { Program } from "./program"

export class Light {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _position: [number, number, number] = [0, 0, 0]
  private _direction: [number, number, number] = [0, 0, 0]
  private _eye: [number, number, number] = [0, 0, 0]
  private _modelMatrix: Matrix4 = Matrix4.identity()
  private _invModelMatrix: Matrix4 = Matrix4.identity()
  private _ambientColor: [number, number, number, number] = [0, 0, 0, 1.0]
  private _isUse = true

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations([
      "uLightDirection",
      "uInvModelMatrix",
      "uAmbientColor",
      "uEyeDirection",
      "uModelMatrix",
      "uLightPosition"
    ])
  }

  set ambientColor(color: [number, number, number, number]) {
    this._ambientColor = color
  }

  set position(position: [number, number, number]) {
    this._position = position
  }

  set direction(direction: [number, number, number]) {
    this._direction = direction
  }

  set eye(direction: [number, number, number]) {
    this._eye = direction
  }

  set model(model: Matrix4) {
    this._modelMatrix = model
    this._invModelMatrix = model.inverse()
  }

  enable() {
    this._isUse = true
  }

  disable() {
    this._isUse = false
  }

  reflect() {
    const uLightPosition = this._program.getUniformLocation("uLightPosition")
    const uLightDirection = this._program.getUniformLocation("uLightDirection")
    const uModelMatrix = this._program.getUniformLocation("uModelMatrix")
    const uInvModelMatrix = this._program.getUniformLocation("uInvModelMatrix")
    const uAmbientColor = this._program.getUniformLocation("uAmbientColor")
    const uEyeDirection = this._program.getUniformLocation("uEyeDirection")
    const uIsUseLight = this._program.getUniformLocation("uIsUseLight")

    this._gl.uniform1i(uIsUseLight, this._isUse ? 1 : 0)
    this._gl.uniform3fv(uLightDirection, this._direction)
    this._gl.uniform3fv(uLightPosition, this._position)
    this._gl.uniform3fv(uEyeDirection, this._eye)
    this._gl.uniform4fv(uAmbientColor, this._ambientColor)
    this._gl.uniformMatrix4fv(uModelMatrix, false, this._modelMatrix.values)
    this._gl.uniformMatrix4fv(uInvModelMatrix, false, this._invModelMatrix.values)
  }
}
