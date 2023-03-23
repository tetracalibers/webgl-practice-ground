export class Timer {
  private _startTime: number

  constructor() {
    this._startTime = 0
  }

  start() {
    this._startTime = new Date().getTime()
  }

  update() {
    this._startTime = new Date().getTime()
  }

  get elapsed() {
    return new Date().getTime() - this._startTime
  }
}
