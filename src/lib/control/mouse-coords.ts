export class MouseCoords {
  private _coords: [number, number]

  constructor(canvas: HTMLCanvasElement, x = 0.5, y = 0.5) {
    this._coords = [x, y]
    canvas.addEventListener("mousemove", this.onMouseMove, true)
  }

  private onMouseMove = (e: MouseEvent) => {
    this._coords = [e.offsetX, e.offsetY]
  }

  get xy() {
    return this._coords
  }
}
