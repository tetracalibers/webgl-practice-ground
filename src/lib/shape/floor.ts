// forked from https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/Floor.js

export class Floor {
  private _dimension: number
  private _lines: number
  private _vertices: number[]
  private _indices: number[]
  private _wireframe: boolean
  private _visible: boolean

  constructor(dimension = 50, lines = 5) {
    this._dimension = dimension
    this._lines = lines

    this._vertices = []
    this._indices = []

    this._wireframe = true
    this._visible = true

    this.build(dimension, lines)
  }

  get model() {
    return { vertices: this._vertices, indices: this._indices, wireframe: this._wireframe }
  }

  private build(dimension: number, lines: number) {
    if (dimension) {
      this._dimension = dimension
    }

    if (lines) {
      this._lines = (2 * this._dimension) / lines
    }

    const inc = (2 * this._dimension) / this._lines
    const v = []
    const i = []

    for (let l = 0; l <= this._lines; l++) {
      v[6 * l] = -this._dimension
      v[6 * l + 1] = 0
      v[6 * l + 2] = -this._dimension + l * inc

      v[6 * l + 3] = this._dimension
      v[6 * l + 4] = 0
      v[6 * l + 5] = -this._dimension + l * inc

      v[6 * (this._lines + 1) + 6 * l] = -this._dimension + l * inc
      v[6 * (this._lines + 1) + 6 * l + 1] = 0
      v[6 * (this._lines + 1) + 6 * l + 2] = -this._dimension

      v[6 * (this._lines + 1) + 6 * l + 3] = -this._dimension + l * inc
      v[6 * (this._lines + 1) + 6 * l + 4] = 0
      v[6 * (this._lines + 1) + 6 * l + 5] = this._dimension

      i[2 * l] = 2 * l
      i[2 * l + 1] = 2 * l + 1
      i[2 * (this._lines + 1) + 2 * l] = 2 * (this._lines + 1) + 2 * l
      i[2 * (this._lines + 1) + 2 * l + 1] = 2 * (this._lines + 1) + 2 * l + 1
    }

    this._vertices = v
    this._indices = i
  }
}
