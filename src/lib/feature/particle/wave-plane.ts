import { Matrix4 } from "../../math/matrix"
import { Quaternion } from "../../math/quaternion"
import type { RawVector3 } from "../../math/raw-vector"
import { Vector3 } from "../../math/vector"

export class WavePlaneCamera {
  private _canvas: HTMLCanvasElement
  private _distance: number
  private _clickStart = false
  private _prev: [number, number] = [0, 0]
  private _position: [number, number, number]
  private _up: RawVector3 = [0, 1, 0]
  private _rotateX = 0
  private _rotateY = 0
  private _scale = 0.0

  private _dDistance: number
  private _dPosition: [number, number, number]
  private _dUp: [number, number, number] = [0, 1, 0]

  private _matrix: Matrix4 = Matrix4.identity()
  private _mouseCoords: [number, number] = [0, 0]

  constructor(canvas: HTMLCanvasElement, distance: number) {
    this._canvas = canvas

    this._distance = distance
    this._dDistance = distance

    this._position = [0, 0, distance]
    this._dPosition = [0, 0, distance]

    canvas.addEventListener("mousedown", (e) => this.onMouseInteractionStart(e), { passive: false })
    canvas.addEventListener("touchstart", (e) => this.onMouseInteractionStart(e), { passive: false })

    canvas.addEventListener("mousemove", (e) => this.onMouseInteractionMove(e), { passive: false })
    canvas.addEventListener("touchmove", (e) => this.onMouseInteractionMove(e), { passive: false })

    canvas.addEventListener("mouseup", (e) => this.onMouseInteractionEnd(e), { passive: false })
    canvas.addEventListener("touchend", (e) => this.onMouseInteractionEnd(e), { passive: false })

    canvas.addEventListener("wheel", (e) => this.onWheelScroll(e), { passive: false })
  }

  private isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
    return e.type.startsWith("touch")
  }

  private isMouseEvent = (e: MouseEvent | TouchEvent): e is MouseEvent => {
    return e.type.startsWith("mouse")
  }

  private touchFinger = (e: TouchEvent) => {
    if (e.changedTouches.length !== 1) return null
    const finger = e.changedTouches[0]
    return finger
  }

  private normalizeEvent(e: MouseEvent | TouchEvent) {
    return this.isTouchEvent(e) ? this.touchFinger(e) : e
  }

  private updateCoords(e: MouseEvent | Touch) {
    const box = this._canvas.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    this._mouseCoords = [(x / box.width) * 2 - 1, -((y / box.height) * 2 - 1)]
  }

  private onMouseInteractionStart(e: MouseEvent | TouchEvent) {
    const evt = this.normalizeEvent(e)
    if (!evt) return

    this._clickStart = true
    this._prev = [evt.pageX, evt.pageY]

    e.preventDefault()
  }

  private onMouseInteractionMove(e: MouseEvent | TouchEvent) {
    const evt = this.normalizeEvent(e)
    if (!evt) return

    this.updateCoords(evt)

    if (!this._clickStart) return

    const [x, y] = [evt.pageX, evt.pageY]
    const [dx, dy] = [x - this._prev[0], y - this._prev[1]]

    this._prev = [x, y]

    if (this.isMouseEvent(e) && e.buttons === 1) {
      const { width, height } = this._canvas
      const scale = 1.0 / Math.min(width, height)

      this._rotateX += dx * scale
      this._rotateY += dy * scale

      this._rotateX %= 1.0
      this._rotateY = Math.min(Math.max(this._rotateY % 1.0, -0.25), 0.25)
    }
  }

  private onMouseInteractionEnd(e: MouseEvent | TouchEvent) {
    this._clickStart = false
  }

  private onWheelScroll(e: WheelEvent) {
    const dy = e.deltaY
    this._scale = Math.sign(dy) * 0.8

    e.preventDefault()
  }

  update() {
    const PI2 = Math.PI * 2.0
    let vec: RawVector3 = [1.0, 0.0, 0.0]

    this._scale *= 0.75

    this._distance += this._scale
    this._distance = Math.min(Math.max(this._distance, this._dDistance * 0.1), this._dDistance * 2.0)

    this._dPosition[2] = this._distance

    const qtx = Quaternion.rotationAround(new Vector3(0, 1, 0), this._rotateX * PI2)
    const qty = Quaternion.rotationAround(qtx.toRotatedVector3(...vec), this._rotateY * PI2)

    const q = qtx.multiply(qty)

    this._position = q.toRotatedVector3(...this._dPosition).rawValues
    this._up = q.toRotatedVector3(...this._dUp).rawValues

    const matV = Matrix4.view(new Vector3(...this._position), new Vector3(0, 0, 0), new Vector3(...this._up))
    const matP = Matrix4.perspective(45, this._canvas.width / this._canvas.height, 0.1, this._distance * 5.0)
    this._matrix = matP.multiply(matV)
  }

  get matrix() {
    return this._matrix
  }

  get mouseCoords() {
    return this._mouseCoords
  }
}
