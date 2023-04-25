import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { toRad } from "@/lib/math/radian"
import { PointLight } from "@/lib/light/point-light"
import { Floor } from "@/lib/shape/floor"
import { Axis } from "@/lib/shape/axis"
import { UniformLoader } from "@/lib/webgl/uniform-loader"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import coneModel from "@/lib/model/cone3.json" assert { type: "json" }

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
  let uniforms: UniformLoader<"uWireframe">

  let coordinates: "WORLD" | "CAMERA" = "WORLD"
  let home: RawVector3 = [0, -2, -50]
  let position: RawVector3 = [0, -2, -50]
  let modelMatrix = Matrix4.identity().translate(...home)

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("coordinates", coordinates, ["WORLD", "CAMERA"], (v) => {
      coordinates = v
      position = home
    })
    ui.xyz("position", position, -100, 100, -0.1, (v) => (position = v))
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
    gl.clearDepth(1)

    program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()
    uniforms = new UniformLoader(gl, program, ["uWireframe"])

    light = new PointLight(gl, program)
    light.position = [0, 120, 120]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [0.2, 0.2, 0.2, 1]

    camera = new Camera()
    camera.position = [0.0, 0.0, 20.0]
    camera.fov = toRad(45)
    camera.near = 0.1
    camera.far = 1000
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const floor = new Floor(80, 2)
    const axis = new Axis(82)

    scene.add({ alias: "floor", ...floor.model, diffuse: [1, 1, 1, 1] })
    scene.add({ alias: "axis", ...axis.model, diffuse: [1, 1, 1, 1] })
    scene.add({ alias: "cone", ...coneModel })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    if (coordinates === "WORLD") {
      modelMatrix = Matrix4.identity().translate(...position)
      light.updateNormalMatrixFrom(modelMatrix)
    }
    if (coordinates === "CAMERA") {
      camera.update(Matrix4.identity().translate(...position))
    }

    transforms.push(modelMatrix)
    transforms.pop()
    transforms.setMatrixUniforms()

    light.setUniforms()

    scene.traverseDraw((obj) => {
      uniforms.boolean("uWireframe", !!obj.wireframe)
      obj.material?.setUniforms()

      obj.bind()

      const mode = obj.wireframe ? gl.LINES : gl.TRIANGLES
      gl.drawElements(mode, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = () => {
    configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
