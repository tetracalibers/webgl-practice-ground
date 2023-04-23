import { Quaternion } from "../math/quaternion"
import { Vector3 } from "../math/vector"

export class MouseCoords {
  private _rect: DOMRect
  private _coords: [number, number]

  constructor(canvas: HTMLCanvasElement, flagX?: number, flagY?: number) {
    this._rect = canvas.getBoundingClientRect()

    const { width, left, top, height } = this._rect
    const x = left + width * (flagX !== undefined ? this.clampToFragCoord(flagX) : 0.5)
    const y = top + height * (flagY !== undefined ? this.clampToFragCoord(flagY) : 0.5)
    this._coords = [x, y]

    canvas.addEventListener("mousemove", this.onMove, { passive: false })
    canvas.addEventListener("touchmove", this.onMove, { passive: false })
  }

  private clampToFragCoord(v: number) {
    return Math.min(Math.max(v, 0), 1)
  }

  private innerPos = (x: number, y: number): [number, number] => {
    return [x - this._rect.left, y - this._rect.top]
  }

  private saveTouchPos = (e: TouchEvent) => {
    if (e.changedTouches.length !== 1) return
    const finger = e.changedTouches[0]
    this._coords = this.innerPos(finger.clientX, finger.clientY)
  }

  private saveMousePos = (e: MouseEvent) => {
    this._coords = this.innerPos(e.clientX, e.clientY)
  }

  private isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
    return e.type.startsWith("touch")
  }

  private onMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (this.isTouchEvent(e)) {
      this.saveTouchPos(e)
    } else {
      this.saveMousePos(e)
    }
  }

  get xy() {
    return this._coords
  }

  quaternion() {
    const { width, height } = this._rect
    let [x, y] = this._coords
    // キャンバス中央からの相対的な座標に変換
    x -= width * 0.5
    y -= height * 0.5
    const cvsNorm = Math.sqrt(width * width + height * height)
    const mouseNorm = Math.sqrt(x * x + y * y)
    const angle = (mouseNorm * 2.0 * Math.PI) / cvsNorm
    const axis = new Vector3(y, x, 0.0).normalize()
    return Quaternion.rotationAround(axis, angle)
  }
}
