import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { sphere } from "@/lib/shape/sphere"
import { LambertModel } from "@/lib/light/lambert-model"
import { ControlUi } from "@/lib/gui/control-ui"
import { Timer } from "@/lib/control/timer"
import { toRad } from "@/lib/math/radian"

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
  let light: LambertModel

  let timer: Timer
  let angle = 0

  let lightDiffuseColor: RawVector3 = [1, 1, 1]
  let lightDirection: RawVector3 = [0, -1, -1]
  let sphereColor: RawVector3 = [0.5, 0.8, 0.1]

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgb("Material Diffuse", sphereColor, (v) => (sphereColor = v))
    ui.rgb("Light Diffuse", lightDiffuseColor, (v) => (lightDiffuseColor = v))
    ui.xyz("Light Direction", lightDirection, -10, 10, -0.1, ({ idx, value }) => {
      lightDirection[idx] = idx < 2 ? -value : value
    })
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const startAnimate = () => {
    timer = new Timer()
    timer.start()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.enable(gl.DEPTH_TEST)

    gl.clearColor(0.9, 0.9, 0.9, 1.0)
    gl.clearDepth(1.0)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.position = [0.0, 0.0, 20.0]
    camera.fov = 45
    camera.near = 0.1
    camera.far = 10000
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)
    light = new LambertModel(gl, program)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const sphereGeometry = sphere(5.0, 64, 64, [...sphereColor, 1.0])
    scene.add({ alias: "sphere", ...sphereGeometry, diffuse: sphereColor })
  }

  const animate = () => {
    angle = (90 * timer.elapsed) / 1000.0
  }

  const draw = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const model = Matrix4.identity().translate(0.0, 0.0, -1.5).rotateY(toRad(angle))
    transforms.push(model)
    light.updateNormalMatrixFrom(model)

    light.direction = lightDirection
    light.diffuse = [...lightDiffuseColor, 1.0]

    scene.traverseDraw((obj) => {
      obj.bind()

      if (obj.material) {
        obj.material.diffuse = sphereColor
        obj.material.setUniforms()
      }

      transforms.pop()
      transforms.setMatrixUniforms()

      light.setUniforms()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const render = () => {
    animate()
    draw()
  }

  const init = () => {
    configure()
    registerGeometry()
    startAnimate()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
