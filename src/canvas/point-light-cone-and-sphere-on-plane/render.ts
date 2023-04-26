import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { Timer } from "@/lib/control/timer"
import { toRad } from "@/lib/math/radian"
import { normalizeRgb } from "@/lib/shape/color"
import { PointLight } from "@/lib/light/point-light"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import sphereModel from "@/lib/model/sphere1.json" assert { type: "json" }
import lightModel from "@/lib/model/sphere3.json" assert { type: "json" }
import coneModel from "@/lib/model/cone2.json" assert { type: "json" }
import planeModel from "@/lib/model/plane.json" assert { type: "json" }

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let light: PointLight

  let timer: Timer
  let angle = 0

  let shininess = 200
  let distance = -100
  let lightPosition: RawVector3 = [4.5, 3, 15]
  let sphereColor: RawVector3 = normalizeRgb(0, 255, 0)
  let coneColor: RawVector3 = normalizeRgb(235, 0, 210)

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgb("Sphere Color", sphereColor, (v) => (sphereColor = v))
    ui.rgb("Cone Color", coneColor, (v) => (coneColor = v))
    ui.number("Shininess", shininess, 1, 50, 0.1, (v) => (shininess = v))
    ui.xyz("Light Position", lightPosition, -50, 50, -0.1, ({ idx, value }) => (lightPosition[idx] = value))
    ui.number("Distance", distance, -200, -50, 0.1, (v) => (distance = v))
  }

  const startAnimate = () => {
    timer = new Timer()
    timer.start()
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = () => {
    space.fitHorizontal()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clearColor(0.9, 0.9, 0.9, 1)
    gl.clearDepth(100)

    program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.position = [0.0, 0.0, 20.0]
    camera.fov = toRad(45)
    camera.near = 0.1
    camera.far = 1000
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)
    light = new PointLight(gl, program)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    scene.add({ alias: "plane", ...planeModel })
    scene.add({ alias: "cone", ...coneModel })
    scene.add({ alias: "sphere", ...sphereModel })
    scene.add({ alias: "light", ...lightModel })
  }

  const animate = () => {
    angle = (90 * timer.elapsed) / 10000.0
  }

  const draw = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    light.position = lightPosition
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [1, 1, 1, 1]
    light.specular = [1, 1, 1, 1]
    light.shininess = shininess

    scene.traverseDraw((obj) => {
      let model = Matrix4.identity().translate(0.0, 0.0, distance).rotateX(toRad(30)).rotateY(toRad(angle))

      if (obj.alias === "light") {
        model = model.translate(...lightPosition)
      }

      transforms.push(model)
      light.updateNormalMatrixFrom(model)

      if (obj.alias === "sphere" && obj.material) {
        obj.material.diffuse = sphereColor
      }
      if (obj.alias === "cone" && obj.material) {
        obj.material.diffuse = coneColor
      }

      obj.bind()
      obj.material?.setUniforms()

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
