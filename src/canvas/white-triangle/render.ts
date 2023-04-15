import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { equilateralTriangle } from "@/lib/shape/triangle"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let camera: Camera
  let transforms: Transforms

  const configure = () => {
    space.autoResize(() => space.fitScreenSquare())

    // canvasを初期化する色を設定する
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(1.0)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)

    camera = new Camera()
    camera.position = [0.0, 1.0, 3.0]
    camera.fov = 90
    camera.far = 100
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)
    transforms.setMatrixUniforms()
  }

  const generateTriangle = () => {
    const { indices, vertices } = equilateralTriangle(3, [0, 1.5])

    scene.add({ vertices, indices })
  }

  const draw = () => {
    // canvasを初期化
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    scene.tranverse((obj) => {
      if (obj.hidden) return

      gl.bindVertexArray(obj.vao ?? null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo ?? null)

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      gl.bindVertexArray(null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    })
  }

  const init = () => {
    configure()
    generateTriangle()
    draw()
  }

  init()
}
