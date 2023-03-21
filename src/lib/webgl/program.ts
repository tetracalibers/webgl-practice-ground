import { ShaderCompiler } from "../shader/compile"

export type Attribute = "aVertexPosition" | "aVertexNormal" | "aVertexColor" | "aVertexTextureCoords"

export class Program {
  private _gl: WebGL2RenderingContext
  private _program: WebGLProgram | null
  private _attributes: Record<string, number> = {}
  private _uniforms: Record<string, WebGLUniformLocation | null> = {}

  constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
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

    this.useProgram()
  }

  useProgram() {
    this._gl.useProgram(this._program)
  }

  setAttributeLocations(attributes: string[]) {
    if (!this._program) return
    for (const attribute of attributes) {
      this._attributes[attribute] = this._gl.getAttribLocation(this._program, attribute)
    }
  }

  setUniformLocation(uniforms: string[]) {
    if (!this._program) return
    for (const uniform of uniforms) {
      this._uniforms[uniform] = this._gl.getUniformLocation(this._program, uniform)
    }
  }

  getAttributeLocation(attribute: Attribute) {
    return this._attributes[attribute]
  }

  load(attributes: string[], uniforms: string[]) {
    this.useProgram()
    this.setAttributeLocations(attributes)
    this.setUniformLocation(uniforms)
  }
}
