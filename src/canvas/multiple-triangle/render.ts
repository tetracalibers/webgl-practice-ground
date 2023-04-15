import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { equilateralTriangle } from "@/lib/shape/triangle"
import { Matrix4 } from "@/lib/math/matrix"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let camera: Camera
  let transforms: Transforms

  const onResize = () => {
    space.fitScreen()
    transforms.reset()
    registerModels()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    // canvasを初期化する色を設定する
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(1.0)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)

    camera = new Camera()
    camera.position = [0.0, 0.0, 3.0]
    camera.fov = 90
    camera.near = 0.1
    camera.far = 100
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)

    space.onResize = onResize
  }

  const registerModels = () => {
    const model1 = Matrix4.identity().translate(1.5, 0.0, 0.0)
    transforms.push(model1)

    const model2 = Matrix4.identity().translate(-1.5, 0.0, 0.0)
    transforms.push(model2)
  }

  const regiisterGeometry = () => {
    const { indices, vertices } = equilateralTriangle(2, [0, 0.5])
    // prettier-ignore
    const colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
    ]

    scene.add({ vertices, indices, colors })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    scene.tranverse((obj) => {
      if (obj.hidden) return

      // bind
      gl.bindVertexArray(obj.vao ?? null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo ?? null)

      // draw model-1
      transforms.pop()
      transforms.setMatrixUniforms()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      // draw model-2
      transforms.pop()
      transforms.setMatrixUniforms()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      // clean up
      gl.bindVertexArray(null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    })
  }

  const init = () => {
    configure()
    registerModels()
    regiisterGeometry()
    render()
  }

  init()
}
