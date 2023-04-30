import type { RawVector3, RawVector4 } from "../math/raw-vector"
import type { Program } from "../webgl/program"
import type { LightTerms, LightUniforms, VectorTerms } from "./uniforms.type"

const toFirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)

class Uniform {
  protected _name: string
  protected _value: any

  constructor(name: LightUniforms, value: any) {
    this._name = name
    this._value = value
  }
}

class Uniform1f extends Uniform {
  constructor(name: "uShininess", value: number) {
    super(name, value)
  }

  reflect(gl: WebGL2RenderingContext, program: Program<any, any>) {
    gl.uniform1f(program.getUniformLocation(this._name), this._value)
  }
}

class Uniform3fv extends Uniform {
  constructor(name: VectorTerms, value: number[]) {
    super(name, value)
  }

  reflect(gl: WebGL2RenderingContext, program: Program<any, any>) {
    gl.uniform3fv(program.getUniformLocation(this._name), this._value)
  }
}

class Uniform4fv extends Uniform {
  constructor(name: LightTerms, value: number[]) {
    super(name, value)
  }

  reflect(gl: WebGL2RenderingContext, program: Program<any, any>) {
    gl.uniform4fv(program.getUniformLocation(this._name), this._value)
  }
}

class Uniformfvs {
  protected _name: string
  protected _values: number[][]

  constructor(name: LightUniforms) {
    this._name = name
    this._values = []
  }

  add(value: number[]) {
    this._values.push(value)
  }

  get(idx: number) {
    return this._values[idx]
  }

  edit(idx: number, value: number[]) {
    this._values.splice(idx, 1, value)
  }

  flatten() {
    return this._values.flat()
  }

  get name() {
    return this._name
  }
}

class Uniform3fvs extends Uniformfvs {
  constructor(name: VectorTerms) {
    super(name)
  }

  reflect(gl: WebGL2RenderingContext, program: Program<any, any>) {
    const data = this.flatten()
    if (data.length < 3) return
    gl.uniform3fv(program.getUniformLocation(this._name), data)
  }
}

class Uniform4fvs extends Uniformfvs {
  constructor(name: LightTerms) {
    super(name)
  }

  reflect(gl: WebGL2RenderingContext, program: Program<any, any>) {
    const data = this.flatten()
    if (data.length < 4) return
    gl.uniform4fv(program.getUniformLocation(this._name), data)
  }
}

export class LightItem {
  private _id: string

  private _position: RawVector3 | null = null
  private _direction: RawVector3 | null = null

  private _diffuse: RawVector4 | null = null
  private _ambient: RawVector4 | null = null
  private _specular: RawVector4 | null = null

  constructor(id: string) {
    this._id = id
  }

  get id() {
    return this._id
  }

  set position(value: RawVector3 | null) {
    this._position = value
  }

  get position() {
    return this._position
  }

  set direction(value: RawVector3 | null) {
    this._direction = value
  }

  get direction() {
    return this._direction
  }

  set diffuse(value: RawVector4 | null) {
    this._diffuse = value
  }

  get diffuse() {
    return this._diffuse
  }

  set ambient(value: RawVector4 | null) {
    this._ambient = value
  }

  get ambient() {
    return this._ambient
  }

  set specular(value: RawVector4 | null) {
    this._specular = value
  }

  get specular() {
    return this._specular
  }

  get uniform3fvs() {
    const uniforms: Map<VectorTerms, RawVector3> = new Map()

    this._position && uniforms.set("uLightPosition", this._position)
    this._direction && uniforms.set("uLightDirection", this._direction)

    return uniforms
  }

  get uniform4fvs() {
    const uniforms: Map<LightTerms, RawVector4> = new Map()

    this._ambient && uniforms.set("uLightAmbient", this._ambient)
    this._diffuse && uniforms.set("uLightDiffuse", this._diffuse)
    this._specular && uniforms.set("uLightSpecular", this._specular)

    return uniforms
  }
}

export class LightGroup {
  private _gl: WebGL2RenderingContext
  private _program: Program<any, any>

  private _lights: Map<string, LightItem>
  private _locals: Map<string, Uniform3fvs | Uniform4fvs>
  private _material: Set<string>
  private _globals: Map<string, Uniform1f | Uniform3fv | Uniform4fv>

  constructor(gl: WebGL2RenderingContext, program: Program<any, any>) {
    this._gl = gl
    this._program = program

    this._lights = new Map()
    this._locals = new Map()
    this._material = new Set()
    this._globals = new Map()
  }

  set useMaterial(terms: ("diffuse" | "specular" | "ambient")[]) {
    terms.forEach((term) => {
      this._material.add("uMaterial" + toFirstUpperCase(term))
    })
  }

  set ambient(color: RawVector4) {
    const name = "uLightAmbient"
    this._globals.set(name, new Uniform4fv(name, color))
  }

  set specular(color: RawVector4) {
    const name = "uLightSpecular"
    this._globals.set(name, new Uniform4fv(name, color))
  }

  set diffuse(color: RawVector4) {
    const name = "uLightDiffuse"
    this._globals.set(name, new Uniform4fv(name, color))
  }

  set shininess(value: number) {
    const name = "uShininess"
    this._globals.set(name, new Uniform1f(name, value))
  }

  set position(vec: RawVector3) {
    const name = "uLightPosition"
    this._globals.set(name, new Uniform3fv(name, vec))
  }

  set direction(vec: RawVector3) {
    const name = "uLightDirection"
    this._globals.set(name, new Uniform3fv(name, vec))
  }

  add(light: LightItem) {
    this._lights.set(light.id, light)

    light.uniform3fvs.forEach((value, key) => {
      const uniform = this._locals.get(key) ?? new Uniform3fvs(key)
      uniform.add(value)
      this._locals.set(key, uniform)
    })

    light.uniform4fvs.forEach((value, key) => {
      const uniform = this._locals.get(key) ?? new Uniform4fvs(key)
      uniform.add(value)
      this._locals.set(key, uniform)
    })
  }

  get(id: string) {
    return this._lights.get(id)
  }

  initUniforms() {
    this.setUniformLocations()
    this.updateUniforms()
  }

  private setUniformLocations() {
    const keys = [...this._locals.keys(), ...this._material.keys(), ...this._globals.keys()]
    this._program.setUniformLocations([...new Set<string>(keys)])
  }

  updateUniforms() {
    this._locals.forEach((uniform) => {
      uniform.reflect(this._gl, this._program)
    })
    this._globals.forEach((uniform) => {
      uniform.reflect(this._gl, this._program)
    })
  }
}
