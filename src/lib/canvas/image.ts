export class ImageCanvas {
  private _canvas: HTMLCanvasElement
  private _img: HTMLImageElement
  private _data: ImageData | null = null
  private _width: number
  private _height: number

  constructor(src: string, width: number, height: number) {
    this._canvas = document.createElement("canvas")

    this._width = width
    this._height = height

    this._img = new Image()
    this._img.src = src
  }

  load() {
    return new Promise<void>((resolve, reject) => {
      this._img.onload = () => {
        this.onload()
        resolve()
      }
      this._img.onerror = () => {
        reject()
      }
    })
  }

  private onload() {
    const ctx = this._canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(this._img, 0, 0, this._width, this._height)
    this._data = ctx.getImageData(0, 0, this._width, this._height)
  }

  get data() {
    return this._data?.data
  }

  get width() {
    return this._width
  }

  get height() {
    return this._height
  }
}
