import GUI from "lil-gui"
import type { RawVector3, RawVector4 } from "../math/raw-vector"

export class ControlUi {
  private _gui: GUI

  constructor() {
    this._gui = new GUI()
    this._gui.close()
  }

  rgb(label: string, value: RawVector3, onChangeCallback: (color: RawVector3) => void) {
    const controller = this._gui.addColor({ [label]: value }, label)
    controller.onChange(onChangeCallback)
  }

  rgba(label: string, value: RawVector4, onChangeCallback: (color: RawVector4) => void) {
    const controller = this._gui.addColor({ [label]: value }, label)
    controller.onChange(onChangeCallback)
  }

  number(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChangeCallback: (value: number) => void
  ) {
    const controller = this._gui.add({ [label]: value }, label, min, max, step)
    controller.onChange(onChangeCallback)
  }

  boolean(label: string, value: boolean, onChangeCallback: (value: boolean) => void) {
    const controller = this._gui.add({ [label]: value }, label)
    controller.onChange(onChangeCallback)
  }

  xyz(
    label: string,
    value: RawVector3,
    min: { x: number; y: number; z: number } | number,
    max: { x: number; y: number; z: number } | number,
    step: { x: number; y: number; z: number } | number,
    onChangeCallback: (changed: { idx: number; value: number }) => void
  ) {
    const folder = this._gui.addFolder(label)

    folder.add(
      { x: value[0] },
      "x",
      typeof min === "number" ? min : min.x,
      typeof max === "number" ? max : max.x,
      typeof step === "number" ? step : step.x
    )
    folder.add(
      { y: value[1] },
      "y",
      typeof min === "number" ? min : min.y,
      typeof max === "number" ? max : max.y,
      typeof step === "number" ? step : step.y
    )
    folder.add(
      { z: value[2] },
      "z",
      typeof min === "number" ? min : min.z,
      typeof max === "number" ? max : max.z,
      typeof step === "number" ? step : step.z
    )

    folder.onChange(({ property, value }) => {
      const idx = ["x", "y", "z"].findIndex((v) => v === property)
      idx > -1 && onChangeCallback({ idx, value })
    })
  }

  select<T extends string>(label: string, value: T, options: T[], onChangeCallback: (value: T) => void) {
    const controller = this._gui.add({ [label]: value }, label, options)
    controller.onChange(onChangeCallback)
  }
}
