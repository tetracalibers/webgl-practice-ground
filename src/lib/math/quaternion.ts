/**
 * Copyright (c) 2021 Koto Furumiya
 * Released under the MIT license
 * https://github.com/kotofurumiya/matrixgl/blob/master/LICENSE.md
 */

// @see https://github.com/kotofurumiya/matrixgl/blob/master/src/quaternion.ts

import { Matrix4 } from "./matrix.js"
import { Vector3 } from "./vector.js"

/**
 * Quaternion which is 4-dimensional complex number.
 * See [Wikipedia](https://en.wikipedia.org/wiki/Quaternion).
 *
 * @export
 * @class Quaternion
 */
export class Quaternion {
  protected _values: Float32Array

  constructor(x: number, y: number, z: number, w: number) {
    this._values = new Float32Array([x, y, z, w])
  }

  /**
   * Create a rotation quaternion around `normalizedAxis`.
   * `normalizedAxis` must be normalized.
   *
   * @static
   * @param {Vector3} normalizedAxis
   * @param {number} radian
   * @return {Quaternion}
   * @memberof Quaternion
   */
  static rotationAround(normalizedAxis: Vector3, radian: number): Quaternion {
    const sin = Math.sin(radian / 2.0)
    const cos = Math.cos(radian / 2.0)
    return new Quaternion(normalizedAxis.x * sin, normalizedAxis.y * sin, normalizedAxis.z * sin, cos)
  }

  /**
   * Returns a conjugate quaternion.
   *
   * @type {Quaternion}
   * @memberof Quaternion
   */
  conj(): Quaternion {
    return new Quaternion(-1 * this.x, -1 * this.y, -1 * this.z, this.w)
  }

  /**
   * Returns a normalized quaternion.
   *
   * @return {Quaternion}
   * @memberof Quaternion
   */
  normalize(): Quaternion {
    const mag = this.magnitude
    if (mag === 0) {
      return this
    }
    const r = 1 / mag
    return new Quaternion(this.x * r, this.y * r, this.z * r, this.w * r)
  }

  /**
   * Adds the `other` to the quaternion and returns the sum.
   * This method does not mutate the quaternion.
   *
   * @param {Quaternion} other
   * @return {Quaternion}
   * @memberof Quaternion
   */
  add(other: Quaternion): Quaternion {
    return new Quaternion(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w)
  }

  /**
   * Multiplies the quaternion by `scalar` and returns the product.
   * This method does not mutate the quaternion.
   *
   * @param {number} scalar
   * @return {Quaternion}
   * @memberof Quaternion
   */
  mulByScalar(scalar: number): Quaternion {
    return new Quaternion(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar)
  }

  /**
   * Calculates dot product.
   *
   * @param {Quaternion} other
   * @return {number}
   * @memberof Quaternion
   */
  dot(other: Quaternion): number {
    return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
  }

  /**
   * Multiply by `other` quaternion and returns a product.
   * This method does not mutate the quaternion.
   *
   * @param {Quaternion} other
   * @return {Quaternion}
   * @memberof Quaternion
   */
  multiply(other: Quaternion): Quaternion {
    const a = this
    const b = other

    return new Quaternion(
      a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z, // 1
      a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y, // i
      a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x, // j
      a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w // k
    )
  }

  /**
   * Calculates spherical linear interpolation(also known as Slerp) and returns new `Quaternion` between the quaternion and the other.
   *
   * @param {Quaternion} other
   * @param {number} t
   * @return {Quaternion}
   * @memberof Quaternion
   */
  slerp(other: Quaternion, t: number): Quaternion {
    let dotProd: number = this.dot(other)
    let otherQuaternion: Quaternion = other

    // When the dot product is negative, slerp chooses the longer way.
    // So we should negate the `other` quaternion.
    if (dotProd < 0) {
      dotProd = -dotProd
      otherQuaternion = other.mulByScalar(-1)
    }

    const omega: number = Math.acos(dotProd)
    const sinOmega: number = Math.sin(omega)

    const q1: Quaternion = this.mulByScalar(Math.sin((1 - t) * omega) / sinOmega)
    const q2: Quaternion = otherQuaternion.mulByScalar(Math.sin(t * omega) / sinOmega)

    return q1.add(q2)
  }

  /**
   * Calc magnitude of the quaternion.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  /**
   * Calc norm of the quaternion.
   * An alias for `magnitude`.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get norm(): number {
    return this.magnitude
  }

  /**
   * Returns x value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get x(): number {
    return this._values[0]
  }

  /**
   * Returns y value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get y(): number {
    return this._values[1]
  }

  /**
   * Returns z value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get z(): number {
    return this._values[2]
  }

  /**
   * Returns w value of the vector.
   *
   * @readonly
   * @type {number}
   * @memberof Quaternion
   */
  get w(): number {
    return this._values[3]
  }

  /**
   * Set the `value` as new x.
   *
   * @memberof Quaternion
   */
  set x(value: number) {
    this._values[0] = value
  }

  /**
   * Set the `value` as new y.
   *
   * @memberof Quaternion
   */
  set y(value: number) {
    this._values[1] = value
  }

  /**
   * Set the `value` as new z.
   *
   * @memberof Quaternion
   */
  set z(value: number) {
    this._values[2] = value
  }

  /**
   * Set the `value` as new w.
   *
   * @memberof Quaternion
   */
  set w(value: number) {
    this._values[3] = value
  }

  /**
   * Returns values of the quaternion.
   *
   * @readonly
   * @type {Float32Array}
   * @memberof Quaternion
   */
  get values(): Float32Array {
    return this._values
  }

  /**
   * Convert the quaternion to a rotation matrix.
   *
   * @return {Matrix4}
   * @memberof Quaternion
   */
  toRotationMatrix4(): Matrix4 {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w

    const m11 = 1 - 2 * y * y - 2 * z * z
    const m12 = 2 * x * y - 2 * w * z
    const m13 = 2 * x * z + 2 * w * y
    const m14 = 0
    const m21 = 2 * x * y + 2 * w * z
    const m22 = 1 - 2 * x * x - 2 * z * z
    const m23 = 2 * y * z - 2 * w * x
    const m24 = 0
    const m31 = 2 * x * z - 2 * w * y
    const m32 = 2 * y * z + 2 * w * x
    const m33 = 1 - 2 * x * x - 2 * y * y
    const m34 = 0
    const m41 = 0
    const m42 = 0
    const m43 = 0
    const m44 = 1

    return new Matrix4(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44)
  }

  /**
   * Convert the quaternion to a rotated vector.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @return {Vector3}
   * @memberof Quaternion
   */
  toRotatedVector3(x: number, y: number, z: number): Vector3 {
    const rotation = this
    const conjRotation = this.conj()
    const target = new Quaternion(x, y, z, 0.0)
    const result = conjRotation.multiply(target).multiply(rotation)
    return new Vector3(result.x, result.y, result.z)
  }

  /**
   * Returns values as `String`.
   *
   * @return {string}
   * @memberof Quaternion
   */
  toString(): string {
    return `Quaternion(${this.x}, ${this.y}, ${this.z}, ${this.w})`
  }
}
