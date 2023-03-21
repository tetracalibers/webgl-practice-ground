/**
 * Copyright (c) 2021 Koto Furumiya
 * Released under the MIT license
 * https://github.com/kotofurumiya/matrixgl/blob/master/LICENSE.md
 */

// @see https://github.com/kotofurumiya/matrixgl/blob/master/src/vector_base.ts
// @see https://github.com/kotofurumiya/matrixgl/blob/master/src/float32vector.ts

/**
 * An interface for vectors.
 *
 * @interface Vector
 */
interface Vector {
  /**
   * Returns values of the vector.
   *
   * @type {Float32Array}
   * @memberof Vector
   */
  readonly values: Float32Array

  /**
   * Returns magnitude of the vector.
   *
   * @type {number}
   * @memberof Vector
   */
  readonly magnitude: number

  /**
   * Returns `values` as a string.
   *
   * @return {string}
   * @memberof Vector
   */
  toString(): string
}

/**
 * An abstract class for vectors.
 *
 * @abstract
 * @class VectorBase
 * @implements {Vector}
 */
abstract class VectorBase implements Vector {
  /**
   * Values that the vector contains.
   *
   * @protected
   * @type {Float32Array}
   * @memberof VectorBase
   */
  protected _values: Float32Array

  constructor(values: number[]) {
    this._values = new Float32Array(values)
  }

  get values(): Float32Array {
    return this._values
  }

  get magnitude(): number {
    let sumSq = 0
    for (const val of this._values) {
      sumSq += val ** 2
    }
    return Math.sqrt(sumSq)
  }

  toString(): string {
    const dimension = this._values.length
    return `Vector${dimension}(${this._values.join(", ")})`
  }
}

/**
 * A base abstract class for 3-dimensional vectors.
 *
 * @abstract
 * @class Vector3Base
 * @extends {VectorBase}
 */
abstract class Vector3Base extends VectorBase {
  /**
   * Returns x value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Vector3Base
   */
  get x(): number {
    return this._values[0]
  }

  /**
   * Returns y value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Vector3Base
   */
  get y(): number {
    return this._values[1]
  }

  /**
   * Returns z value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Vector3Base
   */
  get z(): number {
    return this._values[2]
  }

  /**
   * Set the `value` as new x.
   *
   * @memberof Vector3Base
   */
  set x(value: number) {
    this._values[0] = value
  }

  /**
   * Set the `value` as new y.
   *
   * @memberof Vector3Base
   */
  set y(value: number) {
    this._values[1] = value
  }

  /**
   * Set the `value` as new z.
   *
   * @memberof Vector3Base
   */
  set z(value: number) {
    this._values[2] = value
  }
}

/**
 * A 3-dimensional vector of single-precision float numbers.
 *
 * @export
 * @class Vector3
 * @extends {Vector3Base}
 */
export class Vector3 extends Vector3Base {
  constructor(x: number, y: number, z: number) {
    super([x, y, z])
  }

  /**
   * Add `other` to the vector and returns new `Vector3`.
   * This method does not mutate the vector.
   *
   * @param {Vector3} other
   * @return {Vector3}
   * @memberof Vector3
   */
  add(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /**
   * Subtract `other` from the vector and returns new `Vector3`.
   * This method does not mutate the vector.
   *
   * @param {Vector3} other
   * @return {Vector3}
   * @memberof Vector3
   */
  sub(other: Vector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /**
   * Multiply the vector by `scalar` and returns new `Vector3`.
   * This method does not mutate the vector.
   *
   * @param {number} scalar
   * @return {Vector3}
   * @memberof Vector3
   */
  mulByScalar(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  /**
   * Calculate dot product.
   *
   * @param {Vector3} other
   * @return {number}
   * @memberof Vector3
   */
  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  /**
   * Calculate cross product.
   *
   * @param {Vector3} other
   * @return {Vector3}
   * @memberof Vector3
   */
  cross(other: Vector3): Vector3 {
    const cx: number = this.y * other.z - this.z * other.y
    const cy: number = this.z * other.x - this.x * other.z
    const cz: number = this.x * other.y - this.y * other.x

    return new Vector3(cx, cy, cz)
  }

  /**
   * Normalize the vector and returns new `Vector3`.
   * This method does not mutate the vector.
   *
   * @return {Vector3}
   * @memberof Vector3
   */
  normalize(): Vector3 {
    const mag: number = this.magnitude
    if (mag === 0) {
      return this
    }
    return new Vector3(this.x / mag, this.y / mag, this.z / mag)
  }
}
