import type { Program } from "../webgl/program"
import { LightBase } from "./light-base"
import type { FloatTerms, LightTerms, MaterialTerms, VectorTerms } from "./uniforms.type"

const toFirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)

export class LightItem extends LightBase {
  private _id: string

  constructor(id: string) {
    super()

    this._id = id
  }

  get id() {
    return this._id
  }

  get _uColors() {
    return this._colors
  }

  get _uVectors() {
    return this._vectors
  }

  get _uFloats() {
    return this._floats
  }
}

export class LightGroup {
  private _gl: WebGL2RenderingContext
  private _program: Program<any, any>

  private _lights: LightItem[]

  private _vectors: Map<VectorTerms, number[]>
  private _colors: Map<LightTerms, number[]>
  private _floats: Map<FloatTerms, number>

  private _material: Set<MaterialTerms>

  constructor(gl: WebGL2RenderingContext, program: Program<any, any>) {
    this._gl = gl
    this._program = program

    this._lights = []

    this._vectors = new Map()
    this._colors = new Map()
    this._floats = new Map()

    this._material = new Set()
  }

  set useMaterial(terms: ("diffuse" | "specular" | "ambient")[]) {
    terms.forEach((term) => {
      this._material.add(("uMaterial" + toFirstUpperCase(term)) as MaterialTerms)
    })
  }

  add(light: LightItem) {
    this._lights.push(light)

    light._uVectors.forEach((vec, term) => {
      const updated = (this._vectors.get(term) ?? []).concat(vec)
      this._vectors.set(term, updated)
    })
    light._uColors.forEach((color, term) => {
      const updated = (this._colors.get(term) ?? []).concat(color)
      this._colors.set(term, updated)
    })
    light._uFloats.forEach((value, term) => {
      this._floats.set(term, value)
    })
  }

  get(id: string) {
    return this._lights.find((light) => light.id === id)
  }

  updatePositions() {
    const positions = this._lights.reduce<number[]>((prev, light) => {
      return prev.concat(light.getPosition() ?? [])
    }, [])
    this._vectors.set("uLightPosition", positions)
    this._gl.uniform3fv(this._program.getUniformLocation("uLightPosition"), positions)
  }

  initUniforms() {
    this.setUniformLocations()
    this.setUniformValues()
  }

  private setUniformLocations() {
    this._program.setUniformLocations([
      ...this._colors.keys(),
      ...this._vectors.keys(),
      ...this._floats.keys(),
      ...this._material.keys()
    ])
  }

  private setUniformValues() {
    const gl = this._gl
    const program = this._program

    this._colors.forEach((value, key) => {
      gl.uniform4fv(program.getUniformLocation(key), value)
    })

    this._vectors.forEach((value, key) => {
      gl.uniform3fv(program.getUniformLocation(key), value)
    })

    this._floats.forEach((value, key) => {
      gl.uniform1f(program.getUniformLocation(key), value)
    })
  }
}
