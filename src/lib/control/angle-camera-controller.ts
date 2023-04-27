// forked from https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2/blob/master/common/js/Controls.js

import type { AngleCamera } from "../camera/angle-camera"
import type { RawVector2 } from "../math/raw-vector"
import { Pointer } from "./pointer"

export class AngleCameraController extends Pointer {
  private _camera: AngleCamera

  private _dragging: boolean

  private _pos: RawVector2
  private _lastPos: RawVector2

  private _dloc: number
  private _dstep: number

  private _motionFactor: number
  private _keyIncrement: number

  constructor(canvas: HTMLCanvasElement, camera: AngleCamera) {
    super(canvas)

    this._camera = camera

    this._dragging = false

    this._pos = [0, 0]
    this._lastPos = [0, 0]

    this._dloc = 0
    this._dstep = 0

    this._motionFactor = 10
    this._keyIncrement = 5

    canvas.addEventListener("mousedown", (e) => this.onMoveStart(e), { passive: true })
    canvas.addEventListener("touchstart", (e) => this.onMoveStart(e), { passive: true })

    canvas.addEventListener("mousemove", (e) => this.onMove(e), { passive: true })
    canvas.addEventListener("touchmove", (e) => this.onMove(e), { passive: true })

    canvas.addEventListener("mouseup", (e) => this.onMoveEnd(e), { passive: true })
    canvas.addEventListener("touchend", (e) => this.onMoveEnd(e), { passive: true })

    canvas.setAttribute("tabindex", "0")
    canvas.addEventListener("keydown", (e) => this.onKeyDown(e), { passive: false })
  }

  private onMoveStart(e: MouseEvent | TouchEvent) {
    this._dragging = true

    this._pos = this.isTouchEvent(e) ? this.touchPos(e) : this.mousePos(e)
    this._dstep = Math.max(...this._camera.position) / 100
  }

  private onMove(e: MouseEvent | TouchEvent) {
    this._lastPos = this._pos
    this._pos = this.isTouchEvent(e) ? this.touchPos(e) : this.mousePos(e)

    if (!this._dragging) return

    const dx = this._pos[0] - this._lastPos[0]
    const dy = this._pos[1] - this._lastPos[1]

    e.altKey ? this.dolly(dy) : this.rotate(dx, dy)
  }

  private onMoveEnd(e: MouseEvent | TouchEvent) {
    this._dragging = false
  }

  private onKeyDown(e: KeyboardEvent) {
    e.preventDefault()

    switch (e.key) {
      case "Up":
      case "ArrowUp":
        this._camera.addElevation(-this._keyIncrement)
        this._camera.update()
        return
      case "Down":
      case "ArrowDown":
        this._camera.addElevation(this._keyIncrement)
        this._camera.update()
        return
      case "Right":
      case "ArrowRight":
        this._camera.addAzimuth(this._keyIncrement)
        this._camera.update()
        return
      case "Left":
      case "ArrowLeft":
        this._camera.addAzimuth(-this._keyIncrement)
        this._camera.update()
        return
    }
  }

  private dolly(v: number) {
    this._dloc += v > 0 ? this._dstep : -this._dstep
    this._camera.dolly(this._dloc)
  }

  private rotate(dx: number, dy: number) {
    const { width, height } = this._canvas

    const deltaAzimuth = -20 / width
    const deltaElevation = -20 / height

    const azimuth = dx * deltaAzimuth * this._motionFactor
    const elevation = dy * deltaElevation * this._motionFactor

    this._camera.addAzimuth(azimuth)
    this._camera.addElevation(elevation)
    this._camera.update()
  }
}
