import { Matrix4 } from "../math/matrix"
import { rad } from "../math/radian"
import { Vector3 } from "../math/vector"

export class Camera {
  // カメラの位置
  private _position: Vector3
  // 注視点
  private _focusPoint: Vector3
  // カメラの各方向
  private _up: Vector3
  private _right: Vector3
  private _normal: Vector3
  // 行列
  private _lookAt: Matrix4
  // 方位角
  private _azimuth: number
  // 仰角
  private _elevation: number
  // 視野（Field of View）
  private _fov: number
  // minZ
  private _near: number
  // maxZ
  private _far: number

  constructor() {
    this._position = new Vector3(0.0, 0.0, 0.0)
    this._focusPoint = new Vector3(0.0, 0.0, 0.0)
    this._right = new Vector3(1.0, 0.0, 0.0)
    this._up = new Vector3(0.0, 1.0, 0.0)
    this._normal = new Vector3(0.0, 0.0, 1.0)

    this._lookAt = new Matrix4()

    this._azimuth = 0
    this._elevation = 0
    this._fov = 45
    this._near = 0.1
    this._far = 10000
  }

  set position([x, y, z]: [number, number, number]) {
    this._position = new Vector3(x, y, z)
  }

  set focusPoint([x, y, z]: [number, number, number]) {
    this._focusPoint = new Vector3(x, y, z)
  }

  set fov(angle: number) {
    this._fov = angle
  }

  set near(val: number) {
    this._near = val
  }

  set far(val: number) {
    this._far = val
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

  // カメラの各方向を更新
  private updateOrientation() {
    this._right = new Vector3(1.0, 0.0, 0.0).translateByMat4(this._lookAt)
    this._up = new Vector3(0.0, 1.0, 0.0).translateByMat4(this._lookAt)
    this._normal = new Vector3(0.0, 0.0, 1.0).translateByMat4(this._lookAt)
  }

  // カメラを更新
  update() {
    const { x: tx, y: ty, z: tz } = this._position

    const matrix = this._lookAt
      .rotateY(rad.from(this._azimuth))
      .rotateX(rad.from(this._elevation))
      .translate(tx, ty, tz)

    // lookAt配列を更新
    this._lookAt = matrix
    // 各方向ベクトルも同時に更新する
    this.updateOrientation()
  }

  get viewTransform() {
    return this._lookAt.inverse()
  }
}
