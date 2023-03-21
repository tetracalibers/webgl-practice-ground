/**
 * Copyright (c) 2021 Koto Furumiya
 * Released under the MIT license
 * https://github.com/kotofurumiya/matrixgl/blob/master/LICENSE.md
 */

// @see https://github.com/kotofurumiya/matrixgl/blob/master/src/matrix.ts

import { Quaternion } from "./quaternion.js"
import type { Vector3 } from "./vector.js"

/**
 * An interface for matrices;
 *
 * @interface Matrix
 */
interface Matrix {
  /**
   * Values of the matrix, that is stored in column major order.
   *
   * @type {Float32Array}
   * @memberof Matrix
   */
  readonly values: Float32Array

  /**
   * Returns `values` as string.
   *
   * @return {string}
   * @memberof Matrix
   */
  toString(): string
}

/**
 * 4x4 Matrix of single-precision float numbers.
 * Values are stored in column major order.
 *
 * @export
 * @class Matrix4
 * @implements {Matrix}
 */
export class Matrix4 implements Matrix {
  #values: Float32Array

  // prettier-ignore
  constructor(
    m11 = 1.0, m12 = 0.0, m13 = 0.0, m14 = 0.0,
    m21 = 0.0, m22 = 1.0, m23 = 0.0, m24 = 0.0,
    m31 = 0.0, m32 = 0.0, m33 = 1.0, m34 = 0.0,
    m41 = 0.0, m42 = 0.0, m43 = 0.0, m44 = 1.0,
  ) {
    this.#values = new Float32Array([
      m11, m12, m13, m14,
      m21, m22, m23, m24,
      m31, m32, m33, m34,
      m41, m42, m43, m44,
    ])
    return this
  }

  /**
   * Returns an identity matrix.
   *
   * @static
   * @return {Matrix4}
   * @memberof Matrix4
   */
  static identity(): Matrix4 {
    return new Matrix4()
  }

  /**
   * Returns translation matrix.
   *
   * @static
   * @param {number} tx
   * @param {number} ty
   * @param {number} tz
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static translation(tx: number, ty: number, tz: number): Matrix4 {
    return new Matrix4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      tx, ty, tz, 1.0
    )
  }

  /**
   * Returns scaling matrix.
   *
   * @static
   * @param {number} sx
   * @param {number} sy
   * @param {number} sz
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static scaling(sx: number, sy: number, sz: number): Matrix4 {
    return new Matrix4(
      sx, 0.0, 0.0, 0.0,
      0.0, sy, 0.0, 0.0,
      0.0, 0.0, sz, 0.0,
      0.0, 0.0, 0.0, 1.0
    )
  }

  /**
   * Returns rotation matrix around x-axis.
   *
   * @static
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static rotationX(radian: number): Matrix4 {
    const sin = Math.sin(radian)
    const cos = Math.cos(radian)
    
    return new Matrix4(
      1.0, 0.0, 0.0, 0.0,
      0.0, cos, sin, 0.0,
      0.0, -sin, cos, 0.0,
      0.0, 0.0, 0.0, 1.0
    )
  }

  /**
   * Returns rotation matrix around y-axis.
   *
   * @static
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static rotationY(radian: number): Matrix4 {
    const sin: number = Math.sin(radian)
    const cos: number = Math.cos(radian)

    return new Matrix4(
      cos, 0.0, -sin, 0.0,
      0.0, 1.0, 0.0, 0.0,
      sin, 0.0, cos, 0.0,
      0.0, 0.0, 0.0, 1.0
    )
  }

  /**
   * Returns rotation matrix around z-axis.
   *
   * @static
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static rotationZ(radian: number): Matrix4 {
    const sin: number = Math.sin(radian)
    const cos: number = Math.cos(radian)

    return new Matrix4(
      cos, sin, 0.0, 0.0,
      -sin, cos, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    )
  }

  /**
   * Returns rotation matrix around `normalizedAxis`. `normalizedAxis` must be normalized.
   *
   * @static
   * @param {Vector3} normalizedAxis
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  static rotationAround(normalizedAxis: Vector3, radian: number): Matrix4 {
    const q = Quaternion.rotationAround(normalizedAxis, radian)
    return q.toRotationMatrix4()
  }

  /**
   * Returns "look at" matrix.
   *
   * @static
   * @param {Vector3} cameraPosition
   * @param {Vector3} lookAtPosition
   * @param {Vector3} cameraUp
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static lookAt(
    cameraPosition: Vector3,
    lookAtPosition: Vector3,
    cameraUp: Vector3
  ): Matrix4 {
    const zAxis: Vector3 = cameraPosition.sub(lookAtPosition).normalize()
    const xAxis: Vector3 = cameraUp.crossV(zAxis).normalize()
    const yAxis: Vector3 = zAxis.crossV(xAxis).normalize()

    return new Matrix4(
      xAxis.x, yAxis.x, zAxis.x, 0.0,
      xAxis.y, yAxis.y, zAxis.y, 0.0,
      xAxis.z, yAxis.z, zAxis.z, 0.0,
      -cameraPosition.dotV(xAxis), -cameraPosition.dotV(yAxis), -cameraPosition.dotV(zAxis), 1.0
    )
  }

  /**
   * Returns an orthographic projection matrix.
   *
   * @static
   * @param {{top: number; bottom: number; left: number; right: number; near: number; far: number}} argsObject
   * @return {Matrix4}
   * @memberof Matrix4
   */
  // prettier-ignore
  static orthographic(argsObject: {
    top: number
    bottom: number
    left: number
    right: number
    near: number
    far: number
  }): Matrix4 {
    const top: number = argsObject.top
    const bottom: number = argsObject.bottom
    const left: number = argsObject.left
    const right: number = argsObject.right
    const near: number = argsObject.near
    const far: number = argsObject.far

    return new Matrix4(
      2 / (right - left), 0.0, 0.0, 0.0,
      0.0, 2 / (top - bottom), 0.0, 0.0,
      0.0, 0.0, -2 / (far - near), 0.0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1.0
    )
  }

  /**
   * Returns a frustrum projection matrix.
   */
  // prettier-ignore
  static frustum(
    top: number,
    bottom: number,
    left: number,
    right: number,
    near: number,
    far: number
  ): Matrix4 {
    return new Matrix4(
      (2 * near) / (right - left), 0.0, 0.0, 0.0,
      0.0, (2 * near) / (top - bottom), 0.0, 0.0,
      (right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1.0,
      0.0, 0.0, (-2 * far * near) / (far - near), 0.0
    )
  }

  /**
   * Returns a perspective projection matrix.
   */
  static perspective(fov: number, aspectRatio: number, near: number, far: number): Matrix4 {
    const top = near * Math.tan(fov * 0.5)
    const height = top * 2
    const width = aspectRatio * height
    const left = -0.5 * width
    const right = left + width
    const bottom = top - height

    return Matrix4.frustum(top, bottom, left, right, near, far)
  }

  /**
   * Multiply by `other` matrix and returns a product.
   * This method does not mutate the matrix.
   *
   * @param {Matrix4} other
   * @return {Matrix4}
   * @memberof Matrix4
   */
  mulByMatrix4(other: Matrix4): Matrix4 {
    const m11: number = this.#values[0]
    const m12: number = this.#values[4]
    const m13: number = this.#values[8]
    const m14: number = this.#values[12]
    const m21: number = this.#values[1]
    const m22: number = this.#values[5]
    const m23: number = this.#values[9]
    const m24: number = this.#values[13]
    const m31: number = this.#values[2]
    const m32: number = this.#values[6]
    const m33: number = this.#values[10]
    const m34: number = this.#values[14]
    const m41: number = this.#values[3]
    const m42: number = this.#values[7]
    const m43: number = this.#values[11]
    const m44: number = this.#values[15]

    const o11: number = other.values[0]
    const o12: number = other.values[4]
    const o13: number = other.values[8]
    const o14: number = other.values[12]
    const o21: number = other.values[1]
    const o22: number = other.values[5]
    const o23: number = other.values[9]
    const o24: number = other.values[13]
    const o31: number = other.values[2]
    const o32: number = other.values[6]
    const o33: number = other.values[10]
    const o34: number = other.values[14]
    const o41: number = other.values[3]
    const o42: number = other.values[7]
    const o43: number = other.values[11]
    const o44: number = other.values[15]

    const p11: number = m11 * o11 + m12 * o21 + m13 * o31 + m14 * o41
    const p12: number = m11 * o12 + m12 * o22 + m13 * o32 + m14 * o42
    const p13: number = m11 * o13 + m12 * o23 + m13 * o33 + m14 * o43
    const p14: number = m11 * o14 + m12 * o24 + m13 * o34 + m14 * o44

    const p21: number = m21 * o11 + m22 * o21 + m23 * o31 + m24 * o41
    const p22: number = m21 * o12 + m22 * o22 + m23 * o32 + m24 * o42
    const p23: number = m21 * o13 + m22 * o23 + m23 * o33 + m24 * o43
    const p24: number = m21 * o14 + m22 * o24 + m23 * o34 + m24 * o44

    const p31: number = m31 * o11 + m32 * o21 + m33 * o31 + m34 * o41
    const p32: number = m31 * o12 + m32 * o22 + m33 * o32 + m34 * o42
    const p33: number = m31 * o13 + m32 * o23 + m33 * o33 + m34 * o43
    const p34: number = m31 * o14 + m32 * o24 + m33 * o34 + m34 * o44

    const p41: number = m41 * o11 + m42 * o21 + m43 * o31 + m44 * o41
    const p42: number = m41 * o12 + m42 * o22 + m43 * o32 + m44 * o42
    const p43: number = m41 * o13 + m42 * o23 + m43 * o33 + m44 * o43
    const p44: number = m41 * o14 + m42 * o24 + m43 * o34 + m44 * o44

    // prettier-ignore
    return new Matrix4(
      p11, p21, p31, p41,
      p12, p22, p32, p42,
      p13, p23, p33, p43,
      p14, p24, p34, p44
    )
  }

  /**
   * Returns the inverse matrix.
   * This method does not mutate the matrix.
   * @see https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
   *
   * @return {Matrix4}
   * @memberof Matrix4
   */
  inverse(): Matrix4 {
    const m = this.#values
    let inv: number[] = []

    inv[0] =
      m[5] * m[10] * m[15] -
      m[5] * m[11] * m[14] -
      m[9] * m[6] * m[15] +
      m[9] * m[7] * m[14] +
      m[13] * m[6] * m[11] -
      m[13] * m[7] * m[10]

    inv[4] =
      -m[4] * m[10] * m[15] +
      m[4] * m[11] * m[14] +
      m[8] * m[6] * m[15] -
      m[8] * m[7] * m[14] -
      m[12] * m[6] * m[11] +
      m[12] * m[7] * m[10]

    inv[8] =
      m[4] * m[9] * m[15] -
      m[4] * m[11] * m[13] -
      m[8] * m[5] * m[15] +
      m[8] * m[7] * m[13] +
      m[12] * m[5] * m[11] -
      m[12] * m[7] * m[9]

    inv[12] =
      -m[4] * m[9] * m[14] +
      m[4] * m[10] * m[13] +
      m[8] * m[5] * m[14] -
      m[8] * m[6] * m[13] -
      m[12] * m[5] * m[10] +
      m[12] * m[6] * m[9]

    inv[1] =
      -m[1] * m[10] * m[15] +
      m[1] * m[11] * m[14] +
      m[9] * m[2] * m[15] -
      m[9] * m[3] * m[14] -
      m[13] * m[2] * m[11] +
      m[13] * m[3] * m[10]

    inv[5] =
      m[0] * m[10] * m[15] -
      m[0] * m[11] * m[14] -
      m[8] * m[2] * m[15] +
      m[8] * m[3] * m[14] +
      m[12] * m[2] * m[11] -
      m[12] * m[3] * m[10]

    inv[9] =
      -m[0] * m[9] * m[15] +
      m[0] * m[11] * m[13] +
      m[8] * m[1] * m[15] -
      m[8] * m[3] * m[13] -
      m[12] * m[1] * m[11] +
      m[12] * m[3] * m[9]

    inv[13] =
      m[0] * m[9] * m[14] -
      m[0] * m[10] * m[13] -
      m[8] * m[1] * m[14] +
      m[8] * m[2] * m[13] +
      m[12] * m[1] * m[10] -
      m[12] * m[2] * m[9]

    inv[2] =
      m[1] * m[6] * m[15] -
      m[1] * m[7] * m[14] -
      m[5] * m[2] * m[15] +
      m[5] * m[3] * m[14] +
      m[13] * m[2] * m[7] -
      m[13] * m[3] * m[6]

    inv[6] =
      -m[0] * m[6] * m[15] +
      m[0] * m[7] * m[14] +
      m[4] * m[2] * m[15] -
      m[4] * m[3] * m[14] -
      m[12] * m[2] * m[7] +
      m[12] * m[3] * m[6]

    inv[10] =
      m[0] * m[5] * m[15] -
      m[0] * m[7] * m[13] -
      m[4] * m[1] * m[15] +
      m[4] * m[3] * m[13] +
      m[12] * m[1] * m[7] -
      m[12] * m[3] * m[5]

    inv[14] =
      -m[0] * m[5] * m[14] +
      m[0] * m[6] * m[13] +
      m[4] * m[1] * m[14] -
      m[4] * m[2] * m[13] -
      m[12] * m[1] * m[6] +
      m[12] * m[2] * m[5]

    inv[3] =
      -m[1] * m[6] * m[11] +
      m[1] * m[7] * m[10] +
      m[5] * m[2] * m[11] -
      m[5] * m[3] * m[10] -
      m[9] * m[2] * m[7] +
      m[9] * m[3] * m[6]

    inv[7] =
      m[0] * m[6] * m[11] -
      m[0] * m[7] * m[10] -
      m[4] * m[2] * m[11] +
      m[4] * m[3] * m[10] +
      m[8] * m[2] * m[7] -
      m[8] * m[3] * m[6]

    inv[11] =
      -m[0] * m[5] * m[11] +
      m[0] * m[7] * m[9] +
      m[4] * m[1] * m[11] -
      m[4] * m[3] * m[9] -
      m[8] * m[1] * m[7] +
      m[8] * m[3] * m[5]

    inv[15] =
      m[0] * m[5] * m[10] -
      m[0] * m[6] * m[9] -
      m[4] * m[1] * m[10] +
      m[4] * m[2] * m[9] +
      m[8] * m[1] * m[6] -
      m[8] * m[2] * m[5]

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12]
    if (det === 0) return this
    det = 1.0 / det

    inv = inv.map((n) => n * det)

    return new Matrix4(...inv)
  }

  transpose() {
    const m = this.#values
    let out: number[] = []

    out[0] = m[0]
    out[1] = m[4]
    out[2] = m[8]
    out[3] = m[12]
    out[4] = m[1]
    out[5] = m[5]
    out[6] = m[9]
    out[7] = m[13]
    out[8] = m[2]
    out[9] = m[6]
    out[10] = m[10]
    out[11] = m[14]
    out[12] = m[3]
    out[13] = m[7]
    out[14] = m[11]
    out[15] = m[15]

    return new Matrix4(...out)
  }

  /**
   * Translate the matrix and returns new `Matrix4`.
   * This method does not mutate the matrix.
   *
   * @param {number} tx
   * @param {number} ty
   * @param {number} tz
   * @return {Matrix4}
   * @memberof Matrix4
   */
  translate(tx: number, ty: number, tz: number): Matrix4 {
    const t = Matrix4.translation(tx, ty, tz)
    return this.mulByMatrix4(t)
  }

  /**
   * Scale the matrix and returns new `Matrix4`.
   *
   * @param {number} sx
   * @param {number} sy
   * @param {number} sz
   * @return {Matrix4}
   * @memberof Matrix4
   */
  scale(sx: number, sy: number, sz: number): Matrix4 {
    const s = Matrix4.scaling(sx, sy, sz)
    return this.mulByMatrix4(s)
  }

  /**
   * Rotate the matrix around x-axis and returns new `Matrix4`.
   * This method does not mutate the matrix.
   *
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  rotateX(radian: number): Matrix4 {
    const rx = Matrix4.rotationX(radian)
    return this.mulByMatrix4(rx)
  }

  /**
   * Rotate the matrix around y-axis and returns new `Matrix4`.
   * This method does not mutate the matrix.
   *
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  rotateY(radian: number): Matrix4 {
    const ry = Matrix4.rotationY(radian)
    return this.mulByMatrix4(ry)
  }

  /**
   * Rotate the matrix around z-axis and returns new `Matrix4`.
   * This method does not mutate the matrix.
   *
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  rotateZ(radian: number): Matrix4 {
    const rz = Matrix4.rotationZ(radian)
    return this.mulByMatrix4(rz)
  }

  /**
   * Rotate the matrix around the `normalizedAxis` and return new Matrix4.
   * This method does not mutate the matrix.
   *
   * @param {Vector3} normalizedAxis
   * @param {number} radian
   * @return {Matrix4}
   * @memberof Matrix4
   */
  rotateAround(normalizedAxis: Vector3, radian: number): Matrix4 {
    const r = Matrix4.rotationAround(normalizedAxis, radian)
    return this.mulByMatrix4(r)
  }

  get values(): Float32Array {
    return this.#values
  }

  toString(): string {
    return this.#values.toString()
  }
}
