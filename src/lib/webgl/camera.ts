import { Matrix4 } from "../math/matrix"
import type { Quaternion } from "../math/quaternion"
import { toRad } from "../math/radian"
import { Vector3 } from "../math/vector"

export class Camera {
  // カメラの位置
  private _position: Vector3
  // 注視点
  private _focusPoint: Vector3
  // カメラの各方向
  private _up: Vector3
  // 行列
  private _matrix: Matrix4
  // 視野（Field of View）
  private _fov: number
  // minZ
  private _near: number
  // maxZ
  private _far: number

  constructor() {
    this._position = new Vector3(0.0, 0.0, 0.0)
    this._focusPoint = new Vector3(0.0, 0.0, 0.0)
    this._up = new Vector3(0.0, 1.0, 0.0)

    this._matrix = new Matrix4()

    this._fov = toRad(45)
    this._near = 0.1
    this._far = 10000
  }

  set position([x, y, z]: [number, number, number]) {
    this._position = new Vector3(x, y, z)
  }

  set positionVector(vec: Vector3) {
    this._position = vec
  }

  set eye([x, y, z]: [number, number, number]) {
    this._focusPoint = new Vector3(x, y, z)
  }

  set eyeVector(vec: Vector3) {
    this._focusPoint = vec
  }

  set fov(angle: number) {
    this._fov = toRad(angle)
  }

  set near(val: number) {
    this._near = val
  }

  set far(val: number) {
    this._far = val
  }

  set up([x, y, z]: [number, number, number]) {
    this._up = new Vector3(x, y, z)
  }

  set upVector(vec: Vector3) {
    this._up = vec
  }

  get fov() {
    return this._fov
  }

  get near() {
    return this._near
  }

  get far() {
    return this._far
  }

  get position() {
    return this._position.rawValues
  }

  get eye() {
    return this._focusPoint.rawValues
  }

  // カメラを更新
  update(matrix?: Matrix4) {
    this._matrix = matrix ?? Matrix4.view(this._position, this._focusPoint, this._up)
  }

  // カメラをクォータニオンで回転
  rotateQ(quaternion: Quaternion) {
    this._matrix = Matrix4.view(this._position, this._focusPoint, this._up).multiply(quaternion.toRotationMatrix4())
  }

  get viewTransform() {
    return this._matrix
  }

  get View() {
    return this._matrix
  }
}
