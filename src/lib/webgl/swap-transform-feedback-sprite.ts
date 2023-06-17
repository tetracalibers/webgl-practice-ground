import { ShaderCompiler } from "../shader/compile"

interface AttribLocation {
  location: number
  components: number
  type: number
  divisor?: number
}

interface BufferData {
  buffer: WebGLBuffer | null
  stride: number
  attribs: AttribLocation[]
}

export class SwapTransformFeedbackSprite {
  private _gl: WebGL2RenderingContext
  private _attiribLocations: Record<"update" | "render" | "sprite", AttribLocation[]> = {
    update: [],
    render: [],
    sprite: []
  }
  private _buffers: (WebGLBuffer | null)[]
  private _vaos: (WebGLVertexArrayObject | null)[]

  private _sptiteBuffer: WebGLBuffer | null

  private _read = 0
  private _write = 1

  private _totalComponents = 0
  private _totalSpriteComponents = 0

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl
    this._buffers = [gl.createBuffer(), gl.createBuffer()]
    this._sptiteBuffer = gl.createBuffer()
    this._vaos = [
      gl.createVertexArray() /* for updating buffer 1 */,
      gl.createVertexArray() /* for updating buffer 2 */,
      gl.createVertexArray() /* for rendering buffer 1 */,
      gl.createVertexArray() /* for rendering buffer 2 */
    ]
  }

  createProgram(vsrc: string, fsrc: string, varyings?: string[]) {
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
    if (varyings && varyings.length > 0) {
      // TransformFeedbackを使用すると、頂点シェーダーが出力する変数の値をキャプチャできる
      // ただし、プログラムをリンクする前に、キャプチャする変数を指定する必要がある
      gl.transformFeedbackVaryings(glprogram, varyings, gl.INTERLEAVED_ATTRIBS)
    }

    // シェーダをリンク
    gl.linkProgram(glprogram)

    // シェーダのリンクが正しく行なわれたかチェック
    if (!gl.getProgramParameter(glprogram, gl.LINK_STATUS)) {
      // 失敗していたら通知
      const error = gl.getProgramInfoLog(glprogram)
      console.error("Could not link program.", error)
      return null
    }

    return glprogram
  }

  private setupBuffer(data: Float32Array) {
    const gl = this._gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers[0])
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers[1])
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW)
  }

  private setupSpriteBuffer(data: Float32Array) {
    const gl = this._gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this._sptiteBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  }

  private setupVao() {
    const vaos = this._vaos
    const buffers = this._buffers
    const attribs = this._attiribLocations
    const totalComponents = this._totalComponents

    const table = [
      {
        vao: vaos[0],
        buffers: [
          {
            buffer: buffers[0],
            stride: 4 * totalComponents,
            attribs: attribs.update
          }
        ]
      },
      {
        vao: vaos[1],
        buffers: [
          {
            buffer: buffers[1],
            stride: 4 * totalComponents,
            attribs: attribs.update
          }
        ]
      },
      {
        vao: vaos[2],
        buffers: [
          {
            buffer: buffers[0],
            stride: 4 * totalComponents,
            attribs: attribs.render
          },
          {
            buffer: this._sptiteBuffer,
            stride: 4 * this._totalSpriteComponents,
            attribs: attribs.sprite
          }
        ]
      },
      {
        vao: vaos[3],
        buffers: [
          {
            buffer: buffers[1],
            stride: 4 * totalComponents,
            attribs: attribs.render
          },
          {
            buffer: this._sptiteBuffer,
            stride: 4 * this._totalSpriteComponents,
            attribs: attribs.sprite
          }
        ]
      }
    ]

    for (let i = 0; i < table.length; i++) {
      const element = table[i]
      this.setupAttribs(element.buffers, element.vao)
    }
  }

  private setupAttribs(buffers: BufferData[], vao: WebGLVertexArrayObject | null) {
    const gl = this._gl

    gl.bindVertexArray(vao)
    for (let i = 0; i < buffers.length; i++) {
      const buffer = buffers[i]
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)

      let offset = 0
      for (const attrib of buffer.attribs) {
        gl.enableVertexAttribArray(attrib.location)
        gl.vertexAttribPointer(attrib.location, attrib.components, attrib.type, false, buffer.stride, offset)

        const type_size = 4
        offset += attrib.components * type_size

        if (attrib.divisor !== undefined) {
          gl.vertexAttribDivisor(attrib.location, attrib.divisor)
        }
      }
    }
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
  }

  registUpdateAttrib(
    location: number,
    components: number,
    type: "FLOAT" | "INT" | "UNSIGNED_INT" = "FLOAT",
    divisor?: number
  ) {
    this._totalComponents += components
    this._attiribLocations.update.push({ location, components, type: this._gl[type], divisor })
  }

  registRenderAttrib(
    location: number,
    components: number,
    type: "FLOAT" | "INT" | "UNSIGNED_INT" = "FLOAT",
    divisor?: number
  ) {
    this._attiribLocations.render.push({ location, components, type: this._gl[type], divisor })
  }

  registSpriteAttrib(location: number, components: number, type: "FLOAT" | "INT" | "UNSIGNED_INT" = "FLOAT") {
    this._totalSpriteComponents += components
    this._attiribLocations.sprite.push({ location, components, type: this._gl[type] })
  }

  setupDataAndAttrib(data: Float32Array, spriteData: Float32Array) {
    this.setupBuffer(data)
    this.setupSpriteBuffer(spriteData)
    this.setupVao()
  }

  startUpdate() {
    const gl = this._gl

    gl.bindVertexArray(this._vaos[this._read])
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._buffers[this._write])

    gl.enable(gl.RASTERIZER_DISCARD)

    gl.beginTransformFeedback(gl.POINTS)
  }

  endUpdate() {
    const gl = this._gl

    gl.endTransformFeedback()
    gl.disable(gl.RASTERIZER_DISCARD)
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
  }

  startRender() {
    const gl = this._gl
    gl.bindVertexArray(this._vaos[this._read + 2])
  }

  endRender() {
    ;[this._read, this._write] = [this._write, this._read]
  }
}
