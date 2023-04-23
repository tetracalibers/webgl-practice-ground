import { Matrix4 } from "../math/matrix"
import type { Program } from "../webgl/program"

export class LambertModel {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _lightDirection: [number, number, number] | null = null
  private _lightDiffuseColor: [number, number, number, number] | null = null
  private _materialDiffuseColor: [number, number, number, number] | null = null
  private _normalMatrix: Matrix4 = Matrix4.identity()

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations(["uNormalMatrix", "uLightDirection", "uLightDiffuse", "uMaterialDiffuse"])
  }

  set direction(direction: [number, number, number]) {
    this._lightDirection = direction
  }

  set diffuseColor(color: [number, number, number, number]) {
    this._lightDiffuseColor = color
  }

  set materialDiffuseColor(color: [number, number, number, number]) {
    this._materialDiffuseColor = color
  }

  updateNormalMatrixFrom(modelViewMatrix: Matrix4) {
    this._normalMatrix = modelViewMatrix.inverse().transpose()
  }

  setUniforms() {
    const gl = this._gl
    const program = this._program

    if (this._lightDirection) {
      const uLightDirection = program.getUniformLocation("uLightDirection")
      gl.uniform3fv(uLightDirection, this._lightDirection)
    }

    if (this._lightDiffuseColor) {
      const uLightDiffuse = program.getUniformLocation("uLightDiffuse")
      gl.uniform4fv(uLightDiffuse, this._lightDiffuseColor)
    }

    if (this._materialDiffuseColor) {
      const uMaterialDiffuse = program.getUniformLocation("uMaterialDiffuse")
      gl.uniform4fv(uMaterialDiffuse, this._materialDiffuseColor)
    }

    const uNormalMatrix = program.getUniformLocation("uNormalMatrix")
    gl.uniformMatrix4fv(uNormalMatrix, false, this._normalMatrix.values)
  }
}
