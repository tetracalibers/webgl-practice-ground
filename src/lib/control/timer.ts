export class Timer {
  private _startTime: number
  private _totalTime: number

  constructor() {
    this._startTime = 0
    this._totalTime = 0
  }

  start() {
    this._startTime = new Date().getTime()
  }

  reset() {
    this.start()
  }

  update() {
    this._totalTime += (new Date().getTime() - this._startTime) * 0.001
    this._startTime = new Date().getTime()
  }

  get elapsed() {
    return new Date().getTime() - this._startTime
  }

  get totalTime() {
    return this._totalTime
  }
}
