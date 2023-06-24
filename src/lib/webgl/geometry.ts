interface AttributeArg {
  buffer: Float32Array
  location: number
  components: number
  type?: number
  divisor?: number
}

interface Attribute {
  buffer: WebGLBuffer | null
  location: number
  components: number
  type?: number
  divisor?: number
}

interface DrawArg {
  primitive?: "TRIANGLES" | "TRIANGLE_STRIP" | "TRIANGLE_FAN" | "LINES" | "LINE_STRIP" | "LINE_LOOP" | "POINTS"
  count?: number
  offset?: number
}

export class Geometry {
  private _gl: WebGL2RenderingContext
  private _vao: WebGLVertexArrayObject | null
  private _ibo: WebGLBuffer | null

  private _count: number = 0
  private _attributes: Attribute[] = []

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl
    this._vao = gl.createVertexArray()
    this._ibo = gl.createBuffer()
  }

  setup() {
    const gl = this._gl
    const attributes = this._attributes
    const vao = this._vao

    gl.bindVertexArray(vao)

    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i]
      gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer)

      gl.enableVertexAttribArray(attribute.location)
      gl.vertexAttribPointer(attribute.location, attribute.components, attribute.type ?? gl.FLOAT, false, 0, 0)

      if (attribute.divisor !== undefined) {
        gl.vertexAttribDivisor(attribute.location, attribute.divisor)
      }
    }

    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  registAttrib(attr: AttributeArg) {
    const gl = this._gl
    const buffer = this._gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, attr.buffer, gl.STATIC_DRAW)
    this._attributes.push({ ...attr, buffer })
  }

  registIndices(indices: Uint16Array) {
    const gl = this._gl
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    this._count = indices.length
  }

  bind() {
    const gl = this._gl
    gl.bindVertexArray(this._vao)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
  }

  get count() {
    return this._count
  }

  draw({ primitive = "TRIANGLES", count = this._count, offset = 0 }: DrawArg = {}) {
    const gl = this._gl
    gl.drawElements(gl[primitive], count, gl.UNSIGNED_SHORT, offset)
  }
}
