import type { Program } from "./program"

interface RenderObjectSetting {
  alias?: string
  vertices: number[]
  indices: number[]
  hidden?: boolean
}

interface RenderObjectBuffer {
  ibo: WebGLBuffer | null
  vao: WebGLVertexArrayObject | null
}

type RenderObject = RenderObjectSetting & Partial<RenderObjectBuffer>

export class Scene {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _objects: RenderObject[] = []

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program
  }

  add(obj: RenderObject) {
    obj.ibo = this.buildIBO(obj.indices)
    obj.vao = this.buildVAO()

    // vao
    const cleanUp = this.bindVertexArray(obj.vao)

    // attributes
    this.registerPositions(obj)

    // add
    this._objects.push(obj)

    // clean up
    cleanUp()
  }

  tranverse(callback: (obj: RenderObject, idx: number) => void) {
    for (const [i, obj] of this._objects.entries()) {
      callback(obj, i)
    }
  }

  buildIBO(indices: number[]) {
    // バッファオブジェクトの生成
    const ibo = this._gl.createBuffer()
    // バッファをバインドする
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, ibo)
    // バッファにデータをセット
    this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), this._gl.STATIC_DRAW)
    // バッファのバインドを無効化
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null)

    // 生成したIBOを返して終了
    return ibo
  }

  private buildVAO() {
    return this._gl.createVertexArray()
  }

  private bindVertexArray(vao: WebGLVertexArrayObject | null) {
    this._gl.bindVertexArray(vao)
    return () => this._gl.bindVertexArray(null)
  }

  private registerAtrribute(data: Float32Array, location: number, size: number) {
    if (location < 0) return
    const buffer = this._gl.createBuffer()
    // VBOをバインド
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer)
    // VBOにデータをセット
    this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW)
    // attribute属性を有効にする
    this._gl.enableVertexAttribArray(location)
    // attribute属性を登録
    this._gl.vertexAttribPointer(location, size, this._gl.FLOAT, false, 0, 0)

    // clean up
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null)
  }

  private registerPositions(obj: RenderObject) {
    const location = this._program.getAttributeLocation("aVertexPosition")
    const data = new Float32Array(obj.vertices)
    this.registerAtrribute(data, location, 3)
  }
}
