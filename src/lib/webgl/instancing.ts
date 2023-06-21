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

export class Instancing {
  private _gl: WebGL2RenderingContext
  private _vao: WebGLVertexArrayObject | null

  private _attributes: Attribute[] = []

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl
    this._vao = gl.createVertexArray()
  }

  setupAttribs() {
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
  }

  registAttrib(attr: AttributeArg) {
    const gl = this._gl
    const buffer = this._gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, attr.buffer, gl.STATIC_DRAW)
    this._attributes.push({ ...attr, buffer })
  }

  bind() {
    const gl = this._gl
    gl.bindVertexArray(this._vao)
  }
}
