type Callback = () => void

export class EventEmitter {
  private _events: Record<string, Callback[]>

  constructor() {
    this._events = {}
  }

  on(event: string, callback: Callback) {
    // まだ登録されていないeventなら、空配列を用意
    if (!this._events[event]) {
      this._events[event] = []
    }
    // 配列に追加
    this._events[event].push(callback)
  }

  remove(event: string, listener: Callback) {
    // 削除対象が存在しなければ、何もしない
    if (!this._events[event]) return
    const index = this._events[event].indexOf(listener)
    if (~index) {
      this._events[event].splice(index, 1)
    }
  }

  emit(event: string) {
    const events = this._events[event]
    if (!events) return
    events.forEach((callback) => callback())
  }
}
