import { ShaderCompiler } from "../shader/compile"

interface BufferData {
  buffer: WebGLBuffer | null
  stride: number
  location: number
}

export class TransformFeedback {
  private _gl: WebGL2RenderingContext
  private _buffersOut: BufferData[] = []
  private _buffersIn: BufferData[] = []

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl

    const tf = gl.createTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  }

  createSeparateProgram(vsrc: string, fsrc: string, varyings: string[]) {
    const gl = this._gl

    const glprogram = gl.createProgram()

    if (!glprogram) {
      console.error("Could not create program")
      return
    }

    const compiler = new ShaderCompiler(gl)
    const vs = compiler.compileVertexShader(vsrc)
    const fs = compiler.compileFragmentShader(fsrc)
    if (!vs || !fs) return null

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(glprogram, vs)
    gl.attachShader(glprogram, fs)

    // リンクする前に実行
    gl.transformFeedbackVaryings(glprogram, varyings, gl.SEPARATE_ATTRIBS)

    // シェーダをリンク
    gl.linkProgram(glprogram)

    // シェーダのリンクが正しく行なわれたかチェック
    if (!gl.getProgramParameter(glprogram, gl.LINK_STATUS)) {
      // 失敗していたら通知し、削除
      console.error("Could not initialize shaders")
      gl.deleteProgram(glprogram)
      return null
    }

    return glprogram
  }

  setOutPositionVBO(data: number[], location: number) {
    this._buffersOut.push({
      buffer: this.createVBO(data),
      stride: 4,
      location
    })
  }

  setOutColorVBO(data: number[], location: number) {
    this._buffersOut.push({
      buffer: this.createVBO(data),
      stride: 4,
      location
    })
  }

  setInPositionVBO(data: number[], location: number) {
    this._buffersIn.push({
      buffer: this.createFeedbackVBO(data),
      stride: 4,
      location
    })
  }

  setInColorVBO(data: number[], location: number) {
    this._buffersIn.push({
      buffer: this.createFeedbackVBO(data),
      stride: 4,
      location
    })
  }

  updateOutVBO() {
    this.setAttributes(this._buffersOut)
    this.setAttributesBase(this._buffersIn)
  }

  updateInVBO() {
    this.setAttributes(this._buffersIn)
  }

  beginTransformFeedback() {
    const gl = this._gl

    gl.enable(gl.RASTERIZER_DISCARD)
    gl.beginTransformFeedback(gl.POINTS)
  }

  endTransformFeedback() {
    const gl = this._gl

    gl.endTransformFeedback()
    gl.disable(gl.RASTERIZER_DISCARD)

    this.clearAttributesBase(this._buffersIn)
  }

  private createVBO(data: number[]) {
    const gl = this._gl
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return vbo
  }

  private createFeedbackVBO(data: number[]) {
    const gl = this._gl
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_COPY)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return vbo
  }

  private setAttributes(list: BufferData[]) {
    const gl = this._gl
    list.forEach(({ buffer, location, stride }) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
    })
  }

  private setAttributesBase(list: BufferData[]) {
    const gl = this._gl
    list.forEach(({ buffer, location }) => {
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, location, buffer)
    })
  }

  private clearAttributesBase(list: BufferData[]) {
    const gl = this._gl
    list.forEach(({ location }) => {
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, location, null)
    })
  }
}
