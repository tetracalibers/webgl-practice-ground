import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { torus } from "@/lib/shape/torus"
import { Clock } from "@/lib/event/clock"
import { Light } from "@/lib/webgl/light"
import { Quaternion } from "@/lib/math/quaternion"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"
import { Camera } from "@/lib/webgl/camera"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let light: Light
  let count = 0

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
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100

    transforms = new Transforms(gl, program, camera, canvas)

    light = new Light(gl, program)
    light.position = [15.0, 10.0, 15.0]
    light.ambientColor = [0.1, 0.1, 0.1, 1.0]

    space.onResize = onResize
  }

  const regiisterGeometry = () => {
    const torusGeometry = torus(1.5, 0.5, 64, 64)
    scene.add(torusGeometry)
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    count++
    const rad = ((count % 180) * Math.PI) / 90
    const rad2 = ((count % 720) * Math.PI) / 360
    const quaternion = Quaternion.rotationX(rad2)

    camera.positionVector = quaternion.toRotatedVector3(0.0, 0.0, 10.0)
    camera.upVector = quaternion.toRotatedVector3(0.0, 1.0, 0.0)
    camera.update()

    const model = Matrix4.identity().rotateY(rad)
    transforms.push(model)

    light.model = model
    light.eye = camera.position

    scene.traverseDraw((obj) => {
      obj.bind()

      transforms.pop()
      transforms.setMatrixUniforms()
      light.reflect()
      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = () => {
    configure()
    regiisterGeometry()
    clock.on("tick", render)
  }

  init()
}
