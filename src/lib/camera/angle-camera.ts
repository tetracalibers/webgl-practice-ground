// forked from https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/Camera.js

import { Matrix4 } from "../math/matrix"
import { toRad } from "../math/radian"
import type { RawVector3 } from "../math/raw-vector"
import { Vector3 } from "../math/vector"

export type CameraMode = "ORBIT" | "TRACK"

export class AngleCamera {
  private _mode: CameraMode

  private _position: Vector3
  private _focusTo: Vector3
  private _home: Vector3

  private _up: Vector3
  private _right: Vector3
  private _normal: Vector3

  private _matrix: Matrix4

  private _steps: number
  private _azimuth: number
  private _elevation: number
  private _fov: number
  private _near: number
  private _far: number

  constructor(mode: CameraMode = "ORBIT") {
    this._position = new Vector3(0, 0, 0)
    this._focusTo = new Vector3(0, 0, 0)
    this._home = new Vector3(0, 0, 0)

    this._right = new Vector3(0, 0, 0)
    this._up = new Vector3(0, 0, 0)
    this._normal = new Vector3(0, 0, 0)

    this._matrix = Matrix4.identity()

    this._steps = 0
    this._azimuth = 0
    this._elevation = 0
    this._fov = 45
    this._near = 0.1
    this._far = 10000

    this._mode = mode
  }

  goHome(home?: RawVector3) {
    if (home) this._home = new Vector3(...home)
    this.positionV = this._home
    this.azimuth = 0
    this.elevation = 0
    this.update()
  }

  dolly(stepIncrement: number) {
    const normal = this._normal.normalize()
    const step = stepIncrement - this._steps

    if (this._mode === "TRACK") {
      const x = this._position.x - step * normal.x
      const y = this._position.y - step * normal.y
      const z = this._position.z - step * normal.z
      this.position = [x, y, z]
    } else {
      const x = this._position.x
      const y = this._position.y
      const z = this._position.z - step
      this.position = [x, y, z]
    }

    this._steps = stepIncrement
    this.update()
  }

  update() {
    if (this._mode === "TRACK") {
      this._matrix = Matrix4.identity()
        .translate(...this._position.rawValues)
        .rotateY(toRad(this._azimuth))
        .rotateX(toRad(this._elevation))
    } else {
      this._matrix = Matrix4.identity()
        .rotateY(toRad(this._azimuth))
        .rotateX(toRad(this._elevation))
        .translate(...this._position.rawValues)
    }

    if (this._mode === "TRACK") {
      this._position = new Vector3(0, 0, 0).translateByMat4(this._matrix, 1)
    }

    this.updateOrientation()
  }

  get position() {
    return this._position.rawValues
  }

  get fov() {
    return toRad(this._fov)
  }

  get near() {
    return this._near
  }

  get far() {
    return this._far
  }

  get viewTransform() {
    return this._matrix.inverse()
  }

  get View() {
    return this._matrix.inverse()
  }

  set mode(mode: CameraMode) {
    this._mode = mode
  }

  set home([x, y, z]: RawVector3) {
    this._home = new Vector3(x, y, z)
  }

  set homeV(vec: Vector3) {
    this._home = vec
  }

  set position([x, y, z]: RawVector3) {
    this._position = new Vector3(x, y, z)
  }

  set positionV(vec: Vector3) {
    this._position = vec
  }

  set focus([x, y, z]: RawVector3) {
    this._focusTo = new Vector3(x, y, z)
  }

  set focusV(vec: Vector3) {
    this._focusTo = vec
  }

  set azimuth(azimuth: number) {
    this.addAzimuth(azimuth - this._azimuth)
  }

  set elevation(elevation: number) {
    this.addElevation(elevation - this._elevation)
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

  addAzimuth(azimuth: number) {
    this._azimuth += azimuth

    if (this._azimuth > 360 || this._azimuth < -360) {
      this._azimuth = this._azimuth % 360
    }
  }

  addElevation(elevation: number) {
    this._elevation += elevation

    if (this._elevation > 360 || this._elevation < -360) {
      this._elevation = this._elevation % 360
    }
  }

  private updateOrientation() {
    this._right = new Vector3(1, 0, 0).translateByMat4(this._matrix)
    this._up = new Vector3(0, 1, 0).translateByMat4(this._matrix)
    this._normal = new Vector3(0, 0, 1).translateByMat4(this._matrix)
  }
}
