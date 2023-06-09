import type { RawVector3 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { toRadMap3 } from "@/lib/math/radian"
import { PointLight } from "@/lib/light/point-light"
import { Floor } from "@/lib/shape/floor"
import { Axis } from "@/lib/shape/axis"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { Vector3 } from "@/lib/math/vector"

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

  const uniforms = new UniformLoader(gl, ["uWireframe"])

  let coordinates: "WORLD" | "CAMERA" = "WORLD"
  let home: RawVector3 = [0, -2, -50]
  let position: RawVector3 = [0, -2, -50]
  let rotation: RawVector3 = [0, 0, 0]
  let modelMatrix = Matrix4.identity().translate(...home)

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("coordinates", coordinates, ["WORLD", "CAMERA"], (v) => {
      coordinates = v
      position = position = v === "WORLD" ? home : Vector3.negate(...home).rawValues
      rotation = [0, 0, 0]
    })
    ui.xyz("rotate", rotation, -180, 180, 0.1, ({ idx, value }) => (rotation[idx] = value))
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
    uniforms.init(program)

    light = new PointLight(gl, program)
    light.position = [0, 120, 120]
    light.diffuse = [1, 1, 1, 1]
    light.ambient = [0.2, 0.2, 0.2, 1]

    camera = new Camera()
    camera.fov = 45
    camera.near = 0.1
    camera.far = 1000
    camera.update(modelMatrix)

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

    const transform = Matrix4.identity()
      .translate(...position)
      .rotateXYZ(toRadMap3(rotation))

    if (coordinates === "WORLD") {
      modelMatrix = transform
      camera.update(transform.inverse())
    }
    if (coordinates === "CAMERA") {
      camera.update(transform)
      modelMatrix = transform.inverse()
    }

    light.updateNormalMatrixFrom(modelMatrix)
    light.setUniforms()

    transforms.ModelView = modelMatrix
    transforms.setMatrixUniforms()

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
