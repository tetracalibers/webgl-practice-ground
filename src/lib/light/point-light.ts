import { Matrix4 } from "../math/matrix"
import type { RawVector3, RawVector4 } from "../math/raw-vector"
import type { Program } from "../webgl/program"

export class PointLight {
  private _gl: WebGL2RenderingContext
  private _program: Program
  // light
  private _lightPosition: RawVector3 | null = null
  private _lightDiffuseColor: RawVector4 | null = null
  private _lightAmbientColor: RawVector4 | null = null
  private _lightSpecularColor: RawVector4 | null = null
  // other
  private _normalMatrix: Matrix4 = Matrix4.identity()
  private _shininess: number | null = null

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations([
      "uLightPosition",
      "uLightDiffuse",
      "uLightAmbient",
      "uLightSpecular",
      "uShininess",
      "uMaterialDiffuse",
      "uMaterialAmbient",
      "uMaterialSpecular"
    ])
  }

  set position(position: RawVector3) {
    this._lightPosition = position
  }

  set diffuse(color: RawVector4) {
    this._lightDiffuseColor = color
  }

  set ambient(color: RawVector4) {
    this._lightAmbientColor = color
  }

  set specular(color: RawVector4) {
    this._lightSpecularColor = color
  }

  set shininess(value: number) {
    this._shininess = value
  }

  updateNormalMatrixFrom(modelViewMatrix: Matrix4) {
    this._normalMatrix = modelViewMatrix.inverse().transpose()
  }

  setUniforms() {
    const gl = this._gl
    const program = this._program

    if (this._lightPosition) {
      const uLightPosition = program.getUniformLocation("uLightPosition")
      gl.uniform3fv(uLightPosition, this._lightPosition)
    }

    if (this._lightDiffuseColor) {
      const uLightDiffuse = program.getUniformLocation("uLightDiffuse")
      gl.uniform4fv(uLightDiffuse, this._lightDiffuseColor)
    }

    if (this._lightAmbientColor) {
      const uLightAmbient = program.getUniformLocation("uLightAmbient")
      gl.uniform4fv(uLightAmbient, this._lightAmbientColor)
    }

    if (this._lightSpecularColor) {
      const uLightSpecular = program.getUniformLocation("uLightSpecular")
      gl.uniform4fv(uLightSpecular, this._lightSpecularColor)
    }

    if (this._shininess) {
      const uShininess = program.getUniformLocation("uShininess")
      gl.uniform1f(uShininess, this._shininess)
    }

    const uNormalMatrix = program.getUniformLocation("uNormalMatrix")
    gl.uniformMatrix4fv(uNormalMatrix, false, this._normalMatrix.values)
  }
}
