import type { RawVector3, RawVector4 } from "@/lib/math/raw-vector"
import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { ControlUi } from "@/lib/gui/control-ui"
import { Floor } from "@/lib/shape/floor"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { AngleCamera } from "@/lib/camera/angle-camera"
import { AngleCameraController } from "@/lib/control/angle-camera-controller"
import { LightGroup, LightItem } from "@/lib/light/light-group"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import sphereModel from "@/lib/model/sphere3.json" assert { type: "json" }
import wallModel from "@/lib/model/wall.json" assert { type: "json" }

interface LightData {
  id: string
  name: string
  position: RawVector3
  direction: RawVector3
  diffuse: RawVector4
}

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let program: Program
  let camera: AngleCamera
  let transforms: Transforms
  let clock: Clock
  let lights: LightGroup

  const uniforms = new UniformLoader(gl, ["uWireframe", "uLightSource", "uCutOff", "uExpFactor"])
  const lightsData: LightData[] = [
    {
      id: "redLight",
      name: "Red Light",
      position: [0, 7, 3],
      diffuse: [1, 0, 0, 1],
      direction: [0, -2, -0.1]
    },
    {
      id: "greenLight",
      name: "Green Light",
      position: [2.5, 3, 3],
      diffuse: [0, 1, 0, 1],
      direction: [-0.5, 1, -0.1]
    },
    {
      id: "blueLight",
      name: "Blue Light",
      position: [-2.5, 3, 3],
      diffuse: [0, 0, 1, 1],
      direction: [0.5, 1, -0.1]
    }
  ]

  const initLightCutOff = 0.75
  const initExpFactor = 10

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.select("Camera Mode", "ORBIT", ["TRACK", "ORBIT"], (mode) => {
      camera.goHome()
      camera.mode = mode
    })
    lightsData.forEach((light) => {
      ui.xyz(`${light.name} Position`, light.position, -15, 15, 0.1, ({ idx, value }) => {
        const target = lights.get(light.id)
        if (!target) return
        const pos = target.position
        if (!pos) return
        pos[idx] = value
        target.position = pos
        lights.updateUniforms()
      })
    })
    ui.number("Light Cone Cut Off", initLightCutOff, 0, 1, 0.01, (v) => uniforms.float("uCutOff", v))
    ui.number("Exponent Factor", initExpFactor, 1, 100, 0.01, (v) => uniforms.float("uExpFactor", v))
    ui.action("Go Home", () => {
      camera.goHome()
      camera.mode = "ORBIT"
    })
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = () => {
    space.fitHorizontal()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)

    gl.clearColor(0.9, 0.9, 0.9, 1)
    gl.clearDepth(1)

    program = new Program(gl, vertexSource, fragmentSource)
    scene = new Scene(gl, program)

    uniforms.init(program)

    lights = new LightGroup(gl, program)

    lightsData.forEach((data) => {
      const light = new LightItem(data.id)
      light.position = data.position
      light.diffuse = data.diffuse
      light.direction = data.direction
      lights.add(light)
    })

    lights.useMaterial = ["diffuse"]
    lights.initUniforms()

    camera = new AngleCamera("ORBIT")
    camera.goHome([0, 5, 30])
    camera.focus = [0, 0, 0]
    camera.azimuth = 0
    camera.elevation = -3
    camera.update()

    new AngleCameraController(canvas, camera)

    transforms = new Transforms(gl, program, camera, canvas)
    clock = new Clock()

    uniforms.float("uCutOff", initLightCutOff)
    uniforms.float("uExpFactor", initExpFactor)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const floor = new Floor(80, 2)

    scene.add({ alias: "floor", ...floor.model, diffuse: [1, 1, 1, 1] })
    scene.add({ alias: "wall", ...wallModel })

    lightsData.forEach((light) => {
      scene.add({ alias: light.id, ...sphereModel, diffuse: light.diffuse })
    })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    scene.traverseDraw((obj) => {
      obj.material?.setUniforms()
      uniforms.boolean("uWireframe", !!obj.wireframe)

      transforms.ModelView = camera.View

      const light = obj.alias ? lights.get(obj.alias) : null
      if (light) {
        const position = light.position ?? [0, 0, 0]
        const matModel = Matrix4.identity().translate(...position)
        transforms.Model = matModel
        uniforms.boolean("uLightSource", true)
      } else {
        uniforms.boolean("uLightSource", false)
      }

      transforms.setMatrixUniforms()

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
