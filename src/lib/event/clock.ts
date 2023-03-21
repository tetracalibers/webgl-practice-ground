import { EventEmitter } from "./event-emitter"

export class Clock extends EventEmitter {
  private _isRunning: boolean

  constructor() {
    super()
    this._isRunning = true

    this.tick = this.tick.bind(this)
    this.tick()

    window.onblur = () => {
      this.stop()
      console.log("Clock is stopped")
    }

    window.onfocus = () => {
      this.start()
      console.log("Clock is started")
    }
  }

  tick() {
    if (this._isRunning) this.emit("tick")
    requestAnimationFrame(this.tick)
  }

  start() {
    this._isRunning = true
  }

  stop() {
    this._isRunning = false
  }
}
