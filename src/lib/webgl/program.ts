import { ShaderCompiler } from "../shader/compile"
import type { Attribute, Uniform } from "./shader-data.type"

type AttributeMap<A extends string> = Record<A, number>
type UniformMap<U extends string> = Record<U, WebGLUniformLocation | null>

export class Program<A extends string = Attribute, U extends string = Uniform> {
  private _gl: WebGL2RenderingContext
  private _program: WebGLProgram | null
  private _attributes: AttributeMap<A> = <AttributeMap<A>>{}
  private _uniforms: UniformMap<U> = <UniformMap<U>>{}

  constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string, use = true) {
    this._gl = gl
    this._program = gl.createProgram()

    if (!this._program) {
      console.error("Could not create program")
      return
    }

    const compiler = new ShaderCompiler(this._gl)
    const vertexShader = compiler.compileVertexShader(vertexShaderSource)
    const fragmentShader = compiler.compileFragmentShader(fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(this._program, vertexShader)
    gl.attachShader(this._program, fragmentShader)
    // シェーダをリンク
    gl.linkProgram(this._program)

    // シェーダのリンクが正しく行なわれたかチェック
    if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
      // 失敗していたら通知し、削除
      console.error("Could not initialize shaders")
      gl.deleteProgram(this._program)
      return
    }

    use && this.useProgram()
  }

  useProgram() {
    this._gl.useProgram(this._program)
  }

  use() {
    this.useProgram()
  }

  setAttributeLocations(attributes: A[]) {
    if (!this._program) return
    for (const attribute of attributes) {
      this._attributes[attribute] = this._gl.getAttribLocation(this._program, attribute)
    }
  }

  setUniformLocations(uniforms: U[]) {
    if (!this._program) return
    for (const uniform of uniforms) {
      this._uniforms[uniform] = this._gl.getUniformLocation(this._program, uniform)
    }
  }

  getAttributeLocation(attribute: A) {
    return this._attributes[attribute]
  }

  getUniformLocation(uniform: U) {
    return this._uniforms[uniform]
  }

  load(attributes: A[], uniforms: U[]) {
    this.useProgram()
    this.setAttributeLocations(attributes)
    this.setUniformLocations(uniforms)
  }

  get() {
    return this._program
  }
}
