import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { torus } from "@/lib/shape/torus"
import { Vector3 } from "@/lib/math/vector"
import { Clock } from "@/lib/event/clock"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let count = 0

  const rotateAxis = new Vector3(0.0, 1.0, 1.0).normalize()

  const onResize = () => {
    space.fitScreen()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    // カリングと深度テストを有効にする
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.position = [0.0, 0.0, 20.0]
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)

    space.onResize = onResize
  }

  const regiisterGeometry = () => {
    const { indices, vertices, colors } = torus(2.0, 1.0, 50, 50)
    scene.add({ vertices, indices, colors })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    count++
    const rad = ((count % 360) * Math.PI) / 180
    const model = Matrix4.identity().rotateAround(rotateAxis, rad)
    transforms.push(model)

    scene.tranverse((obj) => {
      if (obj.hidden) return

      // bind
      gl.bindVertexArray(obj.vao ?? null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo ?? null)

      // draw model
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
    regiisterGeometry()
    clock.on("tick", render)
  }

  init()
}
