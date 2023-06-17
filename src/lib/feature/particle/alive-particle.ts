import type { RawVector2 } from "@/lib/math/raw-vector"

export class AliveParticlesSystem {
  private _canvas: HTMLCanvasElement

  private _gravity: RawVector2 = [0.0, -0.8]
  private _origin: RawVector2 = [0.0, 0.0]
  private _minTheta = -Math.PI
  private _maxTheta = Math.PI
  private _minSpeed = 0.5
  private _maxSpeed = 1.0
  private _birthRate = 0.5

  private _all: number
  private _alives = 0

  constructor(canvas: HTMLCanvasElement, count: number) {
    this._canvas = canvas
    this._all = count

    canvas.addEventListener("mousemove", (e) => this.onMouseMove(e), { passive: false })
    canvas.addEventListener("touchmove", (e) => this.onMouseMove(e), { passive: false })
  }

  private isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
    return e.type.startsWith("touch")
  }

  private touchFinger = (e: TouchEvent) => {
    if (e.changedTouches.length !== 1) return null
    const finger = e.changedTouches[0]
    return finger
  }

  private normalizeEvent(e: MouseEvent | TouchEvent) {
    return this.isTouchEvent(e) ? this.touchFinger(e) : e
  }

  private getPointerCoords(e: MouseEvent | Touch) {
    const { left, top, width, height } = this._canvas.getBoundingClientRect()
    const x = (2.0 * (e.pageX - left)) / width - 1.0
    const y = -((2.0 * (e.pageY - top)) / height - 1.0)
    return [x, y]
  }

  private onMouseMove(e: MouseEvent | TouchEvent) {
    const evt = this.normalizeEvent(e)
    if (!evt) return

    const [x, y] = this.getPointerCoords(evt)
    this._origin = [x, y]

    e.preventDefault()
  }

  updateForNext(dt: number) {
    // 誕生率と経過時間から、システム内のアクティブなパーティクルの数を加算
    if (this._alives < this._all) {
      this._alives = Math.min(this._all, Math.floor(this._alives + this._birthRate * dt))
    }
  }

  get alives() {
    return this._alives
  }

  get gravity() {
    return this._gravity
  }

  set gravity([x, y]: RawVector2) {
    this._gravity = [x, y]
  }

  get origin() {
    return this._origin
  }

  get minTheta() {
    return this._minTheta
  }

  get maxTheta() {
    return this._maxTheta
  }

  get minSpeed() {
    return this._minSpeed
  }

  set minSpeed(speed: number) {
    this._minSpeed = speed
  }

  get maxSpeed() {
    return this._maxSpeed
  }

  set maxSpeed(speed: number) {
    this._maxSpeed = speed
  }
}
