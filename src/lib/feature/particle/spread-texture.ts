export class SpreadTextureInteraction {
  private _canvas: HTMLCanvasElement

  private _isMouseDown = false
  private _mouseMovePower = 0.0
  private _mouseCoords: [number, number] = [0, 0]

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas

    canvas.addEventListener("mousedown", (e) => this.onMouseInteractionStart(e), { passive: false })
    canvas.addEventListener("touchstart", (e) => this.onMouseInteractionStart(e), { passive: false })

    canvas.addEventListener("mousemove", (e) => this.onMouseInteractionMove(e), { passive: false })
    canvas.addEventListener("touchmove", (e) => this.onMouseInteractionMove(e), { passive: false })

    canvas.addEventListener("mouseup", (e) => this.onMouseInteractionEnd(e), { passive: false })
    canvas.addEventListener("touchend", (e) => this.onMouseInteractionEnd(e), { passive: false })
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

  private updateCoords(e: MouseEvent | Touch) {
    const box = this._canvas.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    this._mouseCoords = [(x / box.width) * 2 - 1, -((y / box.height) * 2 - 1)]
  }

  private onMouseInteractionStart(e: MouseEvent | TouchEvent) {
    this._isMouseDown = true
    this._mouseMovePower = 1.0
  }

  private onMouseInteractionMove(e: MouseEvent | TouchEvent) {
    const evt = this.normalizeEvent(e)
    if (!evt) return

    this.updateCoords(evt)
  }

  private onMouseInteractionEnd(e: MouseEvent | TouchEvent) {
    this._isMouseDown = false
  }

  update() {
    if (this._isMouseDown !== true) {
      this._mouseMovePower *= 0.95
    }
  }

  get mouseCoords() {
    return this._mouseCoords
  }

  get movePower() {
    return this._mouseMovePower
  }
}
