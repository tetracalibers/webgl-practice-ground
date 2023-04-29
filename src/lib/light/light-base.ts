import type { RawVector3, RawVector4 } from "../math/raw-vector"
import type { VectorTerms, LightTerms, FloatTerms } from "./uniforms.type"

export class LightBase {
  protected _vectors: Map<VectorTerms, RawVector3>
  protected _colors: Map<LightTerms, RawVector4>
  protected _floats: Map<FloatTerms, number>

  constructor() {
    this._colors = new Map()
    this._vectors = new Map()
    this._floats = new Map()
  }

  set diffuse(color: RawVector4) {
    this._colors.set("uLightDiffuse", color)
  }

  getDiffuse() {
    return this._colors.get("uLightDiffuse")
  }

  set ambient(color: RawVector4) {
    this._colors.set("uLightAmbient", color)
  }

  getAmbient() {
    return this._colors.get("uLightAmbient")
  }

  set specular(color: RawVector4) {
    this._colors.set("uLightSpecular", color)
  }

  getSpecular() {
    return this._colors.get("uLightSpecular")
  }

  set shininess(value: number) {
    this._floats.set("uShininess", value)
  }

  getShininess() {
    return this._floats.get("uShininess")
  }

  set position(vec: RawVector3) {
    this._vectors.set("uLightPosition", vec)
  }

  getPosition() {
    return this._vectors.get("uLightPosition")
  }

  set direction(vec: RawVector3) {
    this._vectors.set("uLightDirection", vec)
  }

  getDirection() {
    return this._vectors.get("uLightDirection")
  }
}
