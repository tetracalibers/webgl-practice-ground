export class Space {
  private _canvas: HTMLCanvasElement
  private _gl: WebGL2RenderingContext

  constructor(id: string) {
    this._canvas = <HTMLCanvasElement>document.getElementById(id)
    this._gl = <WebGL2RenderingContext>this._canvas.getContext("webgl2")
    if (!this._canvas) console.error("Canvas not found")
    if (!this._gl) console.error("WebGL2 is not available on your browser")
  }

  setSize(width: number, height: number) {
    this._canvas.width = width
    this._canvas.height = height
  }

  fitScreen() {
    this._canvas.width = window.innerWidth
    this._canvas.height = window.innerHeight
  }

  fitScreenSquare() {
    const size = Math.min(window.innerWidth, window.innerHeight)
    this.setSize(size, size)
  }

  autoResize(setSizeFn: () => void) {
    setSizeFn()
    const obserber = new ResizeObserver(setSizeFn)
    obserber.observe(document.body)
  }

  get canvas(): HTMLCanvasElement | null {
    return this._canvas
  }

  get gl() {
    return this._gl
  }
}
