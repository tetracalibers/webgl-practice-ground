import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { Clock } from "@/lib/event/clock"
import { sphere } from "@/lib/shape/sphere"
import { ControlUi } from "@/lib/gui/control-ui"
import { PhongModel } from "@/lib/light/phong-model"
import { Timer } from "@/lib/control/timer"
import { toRad } from "@/lib/math/radian"
import type { RawVector3, RawVector4 } from "@/lib/math/raw-vector"

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
  let light: PhongModel

  let timer: Timer
  let angle = 0

  let wireframe = false
  let clearColor: RawVector4 = [0.9, 0.9, 0.9, 1.0]
  let shininess = 10.0
  let lightDiffuse: RawVector4 = [1.0, 1.0, 1.0, 1.0]
  let lightAmbient: RawVector4 = [0.03, 0.03, 0.03, 1.0]
  let lightSpecular: RawVector4 = [1.0, 1.0, 1.0, 1.0]
  let lightDirection: RawVector3 = [-0.25, -0.25, -0.25]
  let materialDiffuse: RawVector4 = [46.0 / 256.0, 99.0 / 256.0, 191.0 / 256.0, 1.0]
  let materialAmbient: RawVector4 = [1.0, 1.0, 1.0, 1.0]
  let materialSpecular: RawVector4 = [1.0, 1.0, 1.0, 1.0]

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.rgba("Light Diffuse", lightDiffuse, (v) => (lightDiffuse = v))
    ui.number("Light Ambient", lightAmbient[0], 0, 1, 0.01, (v) => (lightAmbient = [v, v, v, 1.0]))
    ui.number("Light Specular", lightSpecular[0], 0, 1, 0.01, (v) => (lightSpecular = [v, v, v, 1.0]))
    ui.xyz("Light Direction", lightDirection, -10, 10, -0.1, (v) => (lightDirection = [-v[0], -v[1], v[2]]))
    ui.rgba("Material Diffuse", materialDiffuse, (v) => (materialDiffuse = v))
    ui.number("Material Ambient", materialAmbient[0], 0, 1, 0.01, (v) => (materialAmbient = [v, v, v, 1.0]))
    ui.number("Material Specular", materialSpecular[0], 0, 1, 0.01, (v) => (materialSpecular = [v, v, v, 1.0]))
    ui.number("Shininess", shininess, 0, 50, 0.1, (v) => (shininess = v))
    ui.rgba("Clear Color", clearColor, (v) => (clearColor = v))
    ui.boolean("Wireframe", wireframe, (v) => (wireframe = v))
  }

  const startAnimate = () => {
    timer = new Timer()
    timer.start()
  }

  const onResize = () => {
    space.fitScreenSquare()
    render()
  }

  const configure = () => {
    space.fitScreenSquare()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clearDepth(100)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.position = [0.0, 0.0, 20.0]
    camera.fov = 45 * (Math.PI / 180)
    camera.near = 0.1
    camera.far = 10000
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)
    light = new PhongModel(gl, program)

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const sphereGeometry = sphere(5.0, 64, 64, [1.0, 1.0, 1.0, 1.0])
    scene.add({ alias: "sphere", ...sphereGeometry })
  }

  const animate = () => {
    angle = (90 * timer.elapsed) / 10000.0
  }

  const draw = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(...clearColor)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const model = Matrix4.identity().translate(0.0, 0.0, -1.5).rotateY(toRad(angle))
    transforms.push(model)
    light.updateNormalMatrixFrom(model)

    light.direction = lightDirection
    light.diffuseColor = lightDiffuse
    light.ambientColor = lightAmbient
    light.specularColor = lightSpecular
    light.materialDiffuseColor = materialDiffuse
    light.materialAmbientColor = materialAmbient
    light.materialSpecularColor = materialSpecular
    light.shininess = shininess

    const renderMode = wireframe ? gl.LINES : gl.TRIANGLES

    scene.traverseDraw((obj) => {
      obj.bind()

      transforms.pop()
      transforms.setMatrixUniforms()
      light.setUniforms()
      gl.drawElements(renderMode, obj.indices.length, gl.UNSIGNED_SHORT, 0)

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
