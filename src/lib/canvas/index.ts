export class Space {
  private _canvas: HTMLCanvasElement

  constructor(id: string) {
    this._canvas = <HTMLCanvasElement>document.getElementById(id)
    if (!this._canvas) {
      throw new Error("Canvas not found")
    }
  }

  setSize(width: number, height: number) {
    this._canvas.width = width
    this._canvas.height = height
  }

  fullScreen() {
    this._canvas.width = window.innerWidth
    this._canvas.height = window.innerHeight
  }

  autoResizeOn() {
    this.fullScreen()
    const observer = new ResizeObserver(this.fullScreen)
    observer.observe(document.body)
  }

  canvas(): HTMLCanvasElement | null {
    return this._canvas
  }

  gl2(options?: WebGLContextAttributes) {
    const ctx = this._canvas.getContext("webgl2", options)
    return ctx
  }
}
