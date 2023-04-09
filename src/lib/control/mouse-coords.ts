export class MouseCoords {
  private _rect: DOMRect
  private _coords: [number, number]

  constructor(canvas: HTMLCanvasElement, x = 0.5, y = 0.5) {
    this._rect = canvas.getBoundingClientRect()
    this._coords = [x, y]

    canvas.addEventListener("mousemove", this.onMove, { passive: false })
    canvas.addEventListener("touchmove", this.onMove, { passive: false })
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
}
