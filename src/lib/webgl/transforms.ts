import type { AngleCamera } from "../camera/angle-camera"
import { Matrix4 } from "../math/matrix"
import type { Camera } from "./camera"
import type { Program } from "./program"
import type { UniformMatrix4fv } from "./shader-data.type"

export class Transforms {
  private _gl: WebGL2RenderingContext
  private _program: Program
  private _camera: Camera | AngleCamera
  private _canvas: HTMLCanvasElement

  private _matrixMV: Matrix4
  private _matrixP: Matrix4
  private _matrixNormal: Matrix4

  private _stack: Matrix4[]

  constructor(gl: WebGL2RenderingContext, program: Program, camera: Camera | AngleCamera, canvas: HTMLCanvasElement) {
    this._gl = gl
    this._program = program
    this._camera = camera
    this._canvas = canvas

    this._matrixMV = this.calcView()
    this._matrixP = this.calcPerspective()
    this._matrixNormal = this.calcNormal()

    this._stack = []

    program.setUniformLocations(["uModelViewMatrix", "uProjectionMatrix", "uNormalMatrix"])
  }

  private calcView() {
    return this._camera.viewTransform
  }

  private calcNormal() {
    return this._matrixMV.inverse().transpose()
  }

  private calcPerspective() {
    const { fov, near, far } = this._camera
    // Bad: Using canvas.width and canvas.height for aspect ratio
    // @see: https://webgl2fundamentals.org/webgl/lessons/webgl-anti-patterns.html
    const aspectRatio = this._canvas.clientWidth / this._canvas.clientHeight

    return Matrix4.perspective(fov, aspectRatio, near, far)
  }

  private calcModelView(newModel?: Matrix4) {
    return newModel ? this.calcView().multiply(newModel) : this.calcView()
  }

  private updateNormal() {
    this._matrixNormal = this.calcNormal()
  }

  private setUniformMatrix4fv(uniform: UniformMatrix4fv, matrix: Matrix4) {
    this._gl.uniformMatrix4fv(this._program.getUniformLocation(uniform), false, matrix.values)
  }

  setMatrixUniforms() {
    this.updateNormal()
    this.setUniformMatrix4fv("uModelViewMatrix", this._matrixMV)
    this.setUniformMatrix4fv("uProjectionMatrix", this._matrixP)
    this.setUniformMatrix4fv("uNormalMatrix", this._matrixNormal)
  }

  set ModelView(matrix: Matrix4) {
    this._matrixMV = matrix
  }

  set Model(model: Matrix4) {
    this._matrixMV = this.calcModelView(model)
  }

  push(model?: Matrix4) {
    this._stack.push(this.calcModelView(model))
  }

  pop() {
    if (!this._stack.length) return
    const item = this._stack.pop()
    if (!item) return
    this._matrixMV = item
  }

  tee() {
    if (!this._stack.length) return
    const item = this._stack.at(-1)
    if (!item) return
    this._matrixMV = item
  }

  reset() {
    this._stack = []
    this._matrixMV = this.calcView()
    this._matrixP = this.calcPerspective()
    this._matrixNormal = this.calcNormal()
  }
}
