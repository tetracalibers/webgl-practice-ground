import { Matrix4 } from "../math/matrix"
import type { RawVector3, RawVector4 } from "../math/raw-vector"
import type { Program } from "../webgl/program"

export class LambertModel {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _lightDirection: RawVector3 | null = null
  private _lightDiffuseColor: RawVector4 | null = null
  private _normalMatrix: Matrix4 = Matrix4.identity()

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations(["uNormalMatrix", "uLightDirection", "uLightDiffuse", "uMaterialDiffuse"])
  }

  set direction(direction: RawVector3) {
    this._lightDirection = direction
  }

  set diffuse(color: RawVector4) {
    this._lightDiffuseColor = color
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

    const uNormalMatrix = program.getUniformLocation("uNormalMatrix")
    gl.uniformMatrix4fv(uNormalMatrix, false, this._normalMatrix.values)
  }
}
