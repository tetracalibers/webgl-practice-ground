import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { torus } from "@/lib/shape/torus"
import { Clock } from "@/lib/event/clock"
import { Light } from "@/lib/webgl/light"
import { MouseCoords } from "@/lib/control/mouse-coords"
import { hsvaToRgba } from "@/lib/shape/color"
import { Vector3 } from "@/lib/math/vector"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

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
  let mouse: MouseCoords
  let count = 0
  let count2 = 0

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.enable(gl.CULL_FACE)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.fov = 90
    camera.near = 0.1
    camera.far = 100
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)
    light = new Light(gl, program)
    mouse = new MouseCoords(canvas, 0.0, 0.0)

    space.onResize = onResize
  }

  const regiisterGeometry = () => {
    const torusGeometry = torus(2.0, 1.0, 64, 64, [1.0, 1.0, 1.0, 1.0])
    scene.add(torusGeometry)
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    count++
    count % 2 === 0 && count2++

    const rad = ((count % 360) * Math.PI) / 180
    const hsv = hsvaToRgba(count2 % 360, 1.0, 1.0, 1.0)

    gl.clearColor(...hsv)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const quaternion = mouse.quaternion()
    camera.position = [0.0, 0.0, 0.0]
    camera.eyeVector = quaternion.toRotatedVector3(0.0, 20.0, 0.0)
    camera.upVector = quaternion.toRotatedVector3(0.0, 0.0, -1.0)
    camera.update()

    const torusCount = 9

    scene.traverseDraw((obj) => {
      obj.bind()

      for (let i = 0; i < torusCount; i++) {
        const model = Matrix4.identity()
          .rotateY((i * 2 * Math.PI) / torusCount)
          .translate(0.0, 0.0, 10.0)
          .rotateAround(new Vector3(1.0, 1.0, 0.0).normalize(), rad)

        transforms.push(model)

        light.model = model
        light.ambientColor = hsvaToRgba(i * 40, 1, 1, 1)
        light.direction = [-0.577, 0.577, 0.577]
        light.eye = camera.eye

        transforms.pop()
        transforms.setMatrixUniforms()
        light.reflect()
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      }

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
