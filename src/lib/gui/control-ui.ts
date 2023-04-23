import GUI from "lil-gui"

export class ControlUi {
  private _gui: GUI

  constructor() {
    this._gui = new GUI()
    this._gui.close()
  }

  rgb(label: string, value: [number, number, number], onChangeCallback: (color: [number, number, number]) => void) {
    const controller = this._gui.addColor({ [label]: value }, label)
    controller.onChange(onChangeCallback)
  }

  xyz(
    label: string,
    value: [number, number, number],
    min: { x: number; y: number; z: number } | number,
    max: { x: number; y: number; z: number } | number,
    step: { x: number; y: number; z: number } | number,
    onChangeCallback: (value: [number, number, number]) => void
  ) {
    const folder = this._gui.addFolder(label)
    folder
      .add(
        { x: value[0] },
        "x",
        typeof min === "number" ? min : min.x,
        typeof max === "number" ? max : max.x,
        typeof step === "number" ? step : step.x
      )
      .onChange((v: number) => onChangeCallback([v, value[1], value[2]]))
    folder
      .add(
        { y: value[1] },
        "y",
        typeof min === "number" ? min : min.y,
        typeof max === "number" ? max : max.y,
        typeof step === "number" ? step : step.y
      )
      .onChange((v: number) => onChangeCallback([value[0], v, value[2]]))
    folder
      .add(
        { z: value[2] },
        "z",
        typeof min === "number" ? min : min.z,
        typeof max === "number" ? max : max.z,
        typeof step === "number" ? step : step.z
      )
      .onChange((v: number) => onChangeCallback([value[0], value[1], v]))
  }
}
