import { Matrix4 } from "../math/matrix"
import type { RawVector3, RawVector4 } from "../math/raw-vector"
import type { Program } from "../webgl/program"

export class PhongModel {
  private _gl: WebGL2RenderingContext
  private _program: Program
  // light
  private _lightDirection: RawVector3 | null = null
  private _lightDiffuseColor: RawVector4 | null = null
  private _lightAmbientColor: RawVector4 | null = null
  private _lightSpecularColor: RawVector4 | null = null
  // material
  private _materialDiffuseColor: RawVector4 | null = null
  private _materialAmbientColor: RawVector4 | null = null
  private _materialSpecularColor: RawVector4 | null = null
  // other
  private _normalMatrix: Matrix4 = Matrix4.identity()
  private _shininess: number | null = null

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setUniformLocations([
      "uLightDirection",
      "uLightDiffuse",
      "uLightAmbient",
      "uLightSpecular",
      "uMaterialDiffuse",
      "uMaterialAmbient",
      "uMaterialSpecular",
      "uNormalMatrix",
      "uShininess"
    ])
  }

  set direction(direction: RawVector3) {
    this._lightDirection = direction
  }

  set diffuseColor(color: RawVector4) {
    this._lightDiffuseColor = color
  }

  set ambientColor(color: RawVector4) {
    this._lightAmbientColor = color
  }

  set specularColor(color: RawVector4) {
    this._lightSpecularColor = color
  }

  set materialDiffuseColor(color: RawVector4) {
    this._materialDiffuseColor = color
  }

  set materialAmbientColor(color: RawVector4) {
    this._materialAmbientColor = color
  }

  set materialSpecularColor(color: RawVector4) {
    this._materialSpecularColor = color
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

    if (this._lightDirection) {
      const uLightDirection = program.getUniformLocation("uLightDirection")
      gl.uniform3fv(uLightDirection, this._lightDirection)
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

    if (this._materialDiffuseColor) {
      const uMaterialDiffuse = program.getUniformLocation("uMaterialDiffuse")
      gl.uniform4fv(uMaterialDiffuse, this._materialDiffuseColor)
    }

    if (this._materialAmbientColor) {
      const uMaterialAmbient = program.getUniformLocation("uMaterialAmbient")
      gl.uniform4fv(uMaterialAmbient, this._materialAmbientColor)
    }

    if (this._materialSpecularColor) {
      const uMaterialSpecular = program.getUniformLocation("uMaterialSpecular")
      gl.uniform4fv(uMaterialSpecular, this._materialSpecularColor)
    }

    if (this._shininess) {
      const uShininess = program.getUniformLocation("uShininess")
      gl.uniform1f(uShininess, this._shininess)
    }

    const uNormalMatrix = program.getUniformLocation("uNormalMatrix")
    gl.uniformMatrix4fv(uNormalMatrix, false, this._normalMatrix.values)
  }
}
