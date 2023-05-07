import { Material, RawMaterial } from "./material"
import type { Program } from "./program"

interface MaterialSettings {
  diffuse?: number[]
  ambient?: number[]
  specular?: number[]
}

interface RenderObjectSetting extends MaterialSettings {
  alias?: string
  vertices: number[]
  indices: number[]
  colors?: number[]
  normals?: number[]
  texCoords?: number[]
  wireframe?: boolean
  hidden?: boolean
}

interface RenderObjectBuffer {
  ibo: WebGLBuffer | null
  vao: WebGLVertexArrayObject | null
  material: Material | null
}

type RenderObject = RenderObjectSetting & Partial<RenderObjectBuffer>

interface RenderObjectWithHelper extends RenderObject {
  bind: () => void
  update: () => void
  cleanup: () => void
  setMaterial: (material: RawMaterial) => void
}

export class Scene {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _objects = new Map<string, RenderObject>()

  constructor(gl: WebGL2RenderingContext, program: Program) {
    this._gl = gl
    this._program = program

    program.setAttributeLocations(["aVertexPosition", "aVertexColor", "aVertexNormal", "aVertexTextureCoords"])
  }

  add(_obj: RenderObjectSetting) {
    let obj: RenderObject = _obj

    obj.ibo = this.buildIBO(obj.indices)
    obj.vao = this.buildVAO()

    if (obj.diffuse || obj.specular || obj.ambient) {
      const material = new Material(this._gl, this._program)

      if (obj.diffuse) material.diffuse = obj.diffuse
      if (obj.specular) material.specular = obj.specular
      if (obj.ambient) material.ambient = obj.ambient

      obj.material = material
    } else {
      obj.material = null
    }

    if (!obj.normals) {
      obj.normals = this.calcNormals(obj.vertices, obj.indices)
    }

    // vao
    const cleanUp = this.bindVertexArray(obj.vao)

    // attributes
    this.bindAttributes(obj)

    // add
    this._objects.set(obj.alias ?? Date.now().toString(), obj)

    // clean up
    cleanUp()
  }

  tranverse(callback: (obj: RenderObject, key: string) => void) {
    for (const [key, obj] of this._objects.entries()) {
      callback(obj, key)
    }
  }

  private drawHelpers(key: string, obj: RenderObject) {
    const bind = () => {
      this._gl.bindVertexArray(obj.vao ?? null)
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, obj.ibo ?? null)
    }

    const setMaterial = (material: RawMaterial) => {
      if (!obj.material) return
      obj.material.diffuse = material.diffuse
      obj.material.ambient = material.ambient
      obj.material.specular = material.specular
    }

    const update = () => {
      this._objects.set(key, obj)
    }

    const cleanup = () => {
      this._gl.bindVertexArray(null)
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null)
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null)
    }

    return {
      bind,
      setMaterial,
      update,
      cleanup
    }
  }

  traverseDraw(callback: (obj: RenderObjectWithHelper, key: string) => void) {
    for (const [key, obj] of this._objects.entries()) {
      if (obj.hidden) continue

      const helpers = this.drawHelpers(key, obj)

      callback({ ...obj, ...helpers }, key)
    }
  }

  draw(alias: string, callback: (obj: RenderObjectWithHelper, key: string) => void) {
    const obj = this._objects.get(alias)
    if (!obj) return

    const helpers = this.drawHelpers(alias, obj)

    callback({ ...obj, ...helpers }, alias)
  }

  private bindAttributes(obj: RenderObject) {
    this.registerPositions(obj.vertices)
    obj.normals && this.registerNormals(obj.normals)
    obj.colors && this.registerColors(obj.colors)
    obj.texCoords && this.registerTexCoords(obj.texCoords)
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

  private registerPositions(vertices: number[]) {
    const location = this._program.getAttributeLocation("aVertexPosition")
    const data = new Float32Array(vertices)
    this.registerAtrribute(data, location, 3)
  }

  private registerNormals(normals: number[]) {
    const location = this._program.getAttributeLocation("aVertexNormal")
    const data = new Float32Array(normals)
    this.registerAtrribute(data, location, 3)
  }

  private registerColors(colors: number[]) {
    const location = this._program.getAttributeLocation("aVertexColor")
    const data = new Float32Array(colors)
    this.registerAtrribute(data, location, 4)
  }

  private registerTexCoords(texCoords: number[]) {
    const location = this._program.getAttributeLocation("aVertexTextureCoords")
    const data = new Float32Array(texCoords)
    this.registerAtrribute(data, location, 2) // vec2型（xy座標）
  }

  private calcNormals(vs: number[], ind: number[]) {
    const x = 0,
      y = 1,
      z = 2,
      ns = []

    // For each vertex, initialize normal x, normal y, normal z
    for (let i = 0; i < vs.length; i += 3) {
      ns[i + x] = 0.0
      ns[i + y] = 0.0
      ns[i + z] = 0.0
    }

    // We work on triads of vertices to calculate
    for (let i = 0; i < ind.length; i += 3) {
      // Normals so i = i+3 (i = indices index)
      const v1 = [],
        v2 = [],
        normal = []

      // p2 - p1
      v1[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x]
      v1[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y]
      v1[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z]

      // p0 - p1
      v2[x] = vs[3 * ind[i] + x] - vs[3 * ind[i + 1] + x]
      v2[y] = vs[3 * ind[i] + y] - vs[3 * ind[i + 1] + y]
      v2[z] = vs[3 * ind[i] + z] - vs[3 * ind[i + 1] + z]

      // Cross product by Sarrus Rule
      normal[x] = v1[y] * v2[z] - v1[z] * v2[y]
      normal[y] = v1[z] * v2[x] - v1[x] * v2[z]
      normal[z] = v1[x] * v2[y] - v1[y] * v2[x]

      // Update the normals of that triangle: sum of vectors
      for (let j = 0; j < 3; j++) {
        ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normal[x]
        ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normal[y]
        ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normal[z]
      }
    }

    // Normalize the result.
    // The increment here is because each vertex occurs.
    for (let i = 0; i < vs.length; i += 3) {
      // With an offset of 3 in the array (due to x, y, z contiguous values)
      const nn = []
      nn[x] = ns[i + x]
      nn[y] = ns[i + y]
      nn[z] = ns[i + z]

      let len = Math.sqrt(nn[x] * nn[x] + nn[y] * nn[y] + nn[z] * nn[z])
      if (len === 0) len = 1.0

      nn[x] = nn[x] / len
      nn[y] = nn[y] / len
      nn[z] = nn[z] / len

      ns[i + x] = nn[x]
      ns[i + y] = nn[y]
      ns[i + z] = nn[z]
    }

    return ns
  }
}
