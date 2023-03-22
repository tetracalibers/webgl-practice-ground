import { Matrix4 } from "../math/matrix"
import type { Camera } from "./camera"
import type { Program } from "./program"
import type { Uniform } from "./shader-data.type"

export class Transforms {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _camera: Camera
  private _canvas: HTMLCanvasElement

  private _modelViewMatrix: Matrix4
  private _projectionMatrix: Matrix4
  private _normalMatrix: Matrix4

  private stack: Matrix4[]

  constructor(gl: WebGL2RenderingContext, program: Program, camera: Camera, canvas: HTMLCanvasElement) {
    this._gl = gl
    this._program = program
    this._camera = camera
    this._canvas = canvas

    this._modelViewMatrix = this.calcModelView()
    this._projectionMatrix = this.calcPerspective()
    this._normalMatrix = this.calcNormal()

    this.stack = []
  }

  private calcModelView() {
    return this._camera.viewTransform
  }

  private calcNormal() {
    return this._modelViewMatrix.inverse().transpose()
  }

  private calcPerspective() {
    const { fov, near, far } = this._camera
    const aspectRatio = this._canvas.width / this._canvas.height

    return Matrix4.perspective(fov, aspectRatio, near, far)
  }

  updateModelView() {
    this._modelViewMatrix = this.calcModelView()
  }

  updateNormal() {
    this._normalMatrix = this.calcNormal()
  }

  updatePerspective() {
    this._projectionMatrix = this.calcPerspective()
  }

  private setUniformMatrix4fv(uniform: Uniform, matrix: Matrix4) {
    this._gl.uniformMatrix4fv(this._program.getUniformLocation(uniform), false, matrix.values)
  }

  setMatrixUniforms() {
    this.updateNormal()
    this.setUniformMatrix4fv("uModelViewMatrix", this._modelViewMatrix)
    this.setUniformMatrix4fv("uProjectionMatrix", this._projectionMatrix)
    this.setUniformMatrix4fv("uNormalMatrix", this._normalMatrix)
  }

  push() {
    this.stack.push(this._modelViewMatrix)
  }

  pop() {
    if (!this.stack.length) return
    const item = this.stack.pop()
    if (!item) return
    this._modelViewMatrix = item
  }
}
