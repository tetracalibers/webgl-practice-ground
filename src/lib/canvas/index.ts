export class Space {
  private _canvas: HTMLCanvasElement
  private _gl: WebGL2RenderingContext

  constructor(id: string, options?: WebGLContextAttributes) {
    this._canvas = <HTMLCanvasElement>document.getElementById(id)
    this._gl = <WebGL2RenderingContext>this._canvas.getContext("webgl2", options)
    if (!this._canvas) console.error("Canvas not found")
    if (!this._gl) console.error("WebGL2 is not available on your browser")
  }

  setSize(width: number, height: number) {
    this._canvas.width = width
    this._canvas.height = height
  }

  fitImage(img: HTMLImageElement) {
    const imgAspect = img.width / img.height
    // 正方形画像なら、品質を落とさない
    if (imgAspect === 1) {
      this.setSize(img.width, img.height)
      return
    }
    const fullW = window.innerWidth
    const fullH = window.innerHeight
    const windowAspect = fullW / fullH
    // 長方形画像は、スクリーンからはみ出ないようにする
    // 品質はやむなく落ちる
    if (imgAspect > windowAspect) {
      this.setSize(fullW, fullW / imgAspect)
    } else {
      this.setSize(fullH * imgAspect, fullH)
    }
  }

  fitScreen() {
    this._canvas.width = window.innerWidth
    this._canvas.height = window.innerHeight
  }

  fitScreenSquare() {
    const size = Math.min(window.innerWidth, window.innerHeight)
    this.setSize(size, size)
  }

  fitHorizontal() {
    const w = window.innerWidth
    const h = window.innerHeight
    if (w < h) {
      this.setSize(w, w)
    } else {
      this.setSize(w, h)
    }
  }

  autoResize(setSizeFn: () => void) {
    setSizeFn()
    const obserber = new ResizeObserver(setSizeFn)
    obserber.observe(document.body)
  }

  set onResize(callback: () => void) {
    const obserber = new ResizeObserver(callback)
    obserber.observe(document.body)
  }

  get canvas(): HTMLCanvasElement | null {
    return this._canvas
  }

  get gl() {
    return this._gl
  }
}
