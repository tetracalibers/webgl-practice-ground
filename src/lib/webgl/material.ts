import type { RawVector4 } from "../math/raw-vector"
import { toRgba } from "../shape/color"
import type { Program } from "./program"
import type { Uniform4fv } from "./shader-data.type"

export type RawMaterial = {
  diffuse: RawVector4
  ambient: RawVector4
  specular: RawVector4
}

export class Material {
  private _gl: WebGL2RenderingContext
  private _program: Program

  private _diffuse: RawVector4 | null = null
  private _ambient: RawVector4 | null = null
  private _specular: RawVector4 | null = null

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program
  }

  set diffuse(color: number[]) {
    this._diffuse = toRgba(color)
  }

  set specular(color: number[]) {
    this._specular = toRgba(color)
  }

  set ambient(color: number[]) {
    this._ambient = toRgba(color)
  }

  setUniforms() {
    this._diffuse && this.setUniform4fv("uMaterialDiffuse", this._diffuse)
    this._ambient && this.setUniform4fv("uMaterialAmbient", this._ambient)
    this._specular && this.setUniform4fv("uMaterialSpecular", this._specular)
  }

  private setUniform4fv(name: Uniform4fv, value: RawVector4) {
    const location = this._program.getUniformLocation(name)
    this._gl.uniform4fv(location, value)
  }
}
