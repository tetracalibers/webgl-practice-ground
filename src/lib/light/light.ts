import type { Program } from "../webgl/program"
import { LightBase } from "./light-base"
import type { MaterialTerms, Terms } from "./uniforms.type"

const toFirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)

export class Light extends LightBase {
  private _gl: WebGL2RenderingContext
  private _program: Program<any, Terms>

  private _material: Set<MaterialTerms>

  constructor(gl: WebGL2RenderingContext, program: Program<any, any>) {
    super()

    this._gl = gl
    this._program = program

    this._material = new Set()
  }

  set useMaterial(terms: ("diffuse" | "specular" | "ambient")[]) {
    terms.forEach((term) => {
      this._material.add(("uMaterial" + toFirstUpperCase(term)) as MaterialTerms)
    })
  }

  setUniformLocations() {
    this._program.setUniformLocations([
      ...this._colors.keys(),
      ...this._vectors.keys(),
      ...this._floats.keys(),
      ...this._material.keys()
    ])
  }

  setUniforms() {
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
