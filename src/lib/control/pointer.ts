export class Pointer {
  protected _canvas: HTMLCanvasElement
  protected _rect: DOMRect

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    this._rect = canvas.getBoundingClientRect()
  }

  protected innerPos = (x: number, y: number): [number, number] => {
    return [x - this._rect.left, y - this._rect.top]
  }

  protected touchPos = (e: TouchEvent): [number, number] => {
    if (e.changedTouches.length !== 1) return [0, 0]
    const finger = e.changedTouches[0]
    return [finger.clientX, finger.clientY]
  }

  protected mousePos = (e: MouseEvent): [number, number] => {
    return [e.clientX, e.clientY]
  }

  protected isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
    return e.type.startsWith("touch")
  }
}
