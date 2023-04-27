import { Quaternion } from "../math/quaternion"
import { Vector3 } from "../math/vector"
import { Pointer } from "./pointer"

export class MouseCoords extends Pointer {
  private _coords: [number, number]

  constructor(canvas: HTMLCanvasElement, flagX?: number, flagY?: number) {
    super(canvas)

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

  private saveTouchPos = (e: TouchEvent) => {
    this._coords = this.innerPos(...this.touchPos(e))
  }

  private saveMousePos = (e: MouseEvent) => {
    this._coords = this.innerPos(...this.mousePos(e))
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
