import { Space } from "@/lib/canvas/index"
import { Program } from "@/lib/webgl/program"
import { Scene } from "@/lib/webgl/scene"
import { Camera } from "@/lib/webgl/camera"
import { Transforms } from "@/lib/webgl/transforms"
import { Matrix4 } from "@/lib/math/matrix"
import { torus } from "@/lib/shape/torus"
import { Clock } from "@/lib/event/clock"
import { Light } from "@/lib/light/light"
import { MouseCoords } from "@/lib/control/mouse-coords"
import { UniformLoader } from "@/lib/webgl/uniform-loader"
import { sphere } from "@/lib/shape/sphere"
import { Texture } from "@/lib/webgl/texture"
import { Vector3 } from "@/lib/math/vector"
import { ControlUi } from "@/lib/gui/control-ui"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

import image from "@/assets/542x542/wallpaper_00313.png"

export const onload = () => {
  const space = new Space("gl-canvas", { stencil: true })
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let scene: Scene
  let camera: Camera
  let transforms: Transforms
  let clock: Clock
  let light: Light
  let texture: Texture
  let mouse: MouseCoords
  let count = 0

  const uniforms = new UniformLoader(gl, ["uUseLight", "uUseTexture", "uDrawOutline", "uThickness"])

  const torusRotateAxis = new Vector3(0.0, 1.0, 1.0).normalize()
  const matSphereModel = Matrix4.identity().scale(50, 50, 50)

  const initThickness = 0.1

  const initGuiControls = () => {
    const ui = new ControlUi()
    ui.number("thickness", initThickness, 0.01, 0.1, 0.01, (v) => uniforms.float("uThickness", v))
  }

  const onResize = () => {
    space.fitHorizontal()
    render()
  }

  const configure = async () => {
    space.fitHorizontal()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)
    gl.clearStencil(0)

    const program = new Program(gl, vertexSource, fragmentSource)

    scene = new Scene(gl, program)
    clock = new Clock()

    camera = new Camera()
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100
    camera.position = [0, 0, 10]
    camera.eye = [0, 0, 0]
    camera.up = [0, 1, 0]
    camera.update()

    transforms = new Transforms(gl, program, camera, canvas)

    light = new Light(gl, program)
    light.direction = [1, 1, 1]
    light.setUniformLocations()
    light.setUniforms()

    mouse = new MouseCoords(canvas)

    uniforms.init(program)
    uniforms.float("uThickness", initThickness)

    texture = new Texture(gl, program, image)
    await texture.load()

    space.onResize = onResize
  }

  const registerGeometry = () => {
    const torusModel = torus(1.0, 0.25, 64, 64)
    const sphereModel = sphere(1.0, 64, 64, [1.0, 1.0, 1.0, 1.0])

    scene.add({ alias: "torus", ...torusModel })
    scene.add({ alias: "sphere", ...sphereModel })
  }

  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

    count++
    const rad = ((count % 360) * Math.PI) / 180

    camera.rotateQ(mouse.quaternion())

    const matTorusModel = Matrix4.identity().rotateAround(torusRotateAxis, rad)

    /* トーラス（シルエット） -------------------------------- */

    // ステンシルテストを有効にする
    gl.enable(gl.STENCIL_TEST)

    // カラーと深度をマスク
    gl.colorMask(false, false, false, false)
    gl.depthMask(false)

    // ステンシル設定
    gl.stencilFunc(gl.ALWAYS, 1, ~0)
    gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE)

    // 使用フラグを設定
    uniforms.boolean("uUseLight", false)
    uniforms.boolean("uUseTexture", false)
    uniforms.boolean("uDrawOutline", true)

    // 変換行列
    transforms.Model = matTorusModel
    transforms.setMatrixUniforms()

    // 描画
    scene.draw("torus", (obj) => {
      obj.bind()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* 球体 ----------------------------------------- */

    // カラーと深度のマスクを解除
    gl.colorMask(true, true, true, true)
    gl.depthMask(true)

    // ステンシル設定
    gl.stencilFunc(gl.EQUAL, 0, ~0)
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)

    // 使用フラグを設定
    uniforms.boolean("uUseLight", false)
    uniforms.boolean("uUseTexture", true)
    uniforms.boolean("uDrawOutline", false)

    // 変換行列
    transforms.Model = matSphereModel
    transforms.setMatrixUniforms()

    texture.use()

    // 描画
    scene.draw("sphere", (obj) => {
      obj.bind()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })

    /* トーラス --------------------------------------- */

    // ステンシルテストを無効にする
    gl.disable(gl.STENCIL_TEST)

    // 使用フラグを設定
    uniforms.boolean("uUseLight", true)
    uniforms.boolean("uUseTexture", false)
    uniforms.boolean("uDrawOutline", false)

    // 変換行列
    transforms.Model = matTorusModel
    transforms.setMatrixUniforms()

    // 描画
    scene.draw("torus", (obj) => {
      obj.bind()

      gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)

      obj.cleanup()
    })
  }

  const init = async () => {
    await configure()
    registerGeometry()
    clock.on("tick", render)

    initGuiControls()
  }

  init()
}
