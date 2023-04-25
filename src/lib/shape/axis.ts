// forked from https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/Axis.js

export class Axis {
  private _wireframe: boolean
  private _indices: number[]
  private _vertices: number[]
  private _dimension: number

  constructor(dimension = 10) {
    this._wireframe = true
    this._indices = [0, 1, 2, 3, 4, 5]
    this._vertices = []
    this._dimension = dimension

    this.build(dimension)
  }

  get model() {
    return { vertices: this._vertices, indices: this._indices, wireframe: this._wireframe }
  }

  private build(dimension: number) {
    if (dimension) {
      this._dimension = dimension
    }

    // prettier-ignore
    this._vertices = [
      -dimension, 0.0, 0.0,
      dimension, 0.0, 0.0,
      0.0, -dimension / 2, 0.0,
      0.0, dimension / 2, 0.0,
      0.0, 0.0, -dimension,
      0.0, 0.0, dimension
    ];
  }
}
