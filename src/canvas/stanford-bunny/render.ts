import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { Uniforms, Program, Geometry } from "sketchgl/webgl"
import { Matrix4, type RawVector3 } from "sketchgl/math"
import { AngleCamera, AngleCameraController } from "sketchgl/camera"

import vert from "./index.vert?raw"
import frag from "./index.frag?raw"

import rabbitModel from "@/model/json/bunny.json" assert { type: "json" }

const sketch: SketchFn = (skCanvas) => {
  const { gl, canvas } = skCanvas

  const uniforms = new Uniforms(gl, [
    "uMatView",
    "uMatModel",
    "uMatProj",
    "uMatNormal",
    "uLightDir",
    "uAmbient",
    "uMaterialColor"
  ])
  const uMaterialColor: RawVector3 = [0.965, 0.776, 0.918]

  const program = new Program(gl)
  program.attach(vert, frag)
  program.activate()

  const rabbit = new Geometry(gl)
  rabbit.registAttrib({ location: 0, components: 3, buffer: new Float32Array(rabbitModel.vertices) })
  rabbit.registAttrib({ location: 1, components: 3, buffer: new Float32Array(rabbitModel.normals) })
  rabbit.registIndices(new Uint16Array(rabbitModel.indices))
  rabbit.setup()

  const camera = new AngleCamera("ORBIT")
  camera.goHome([-0.5, 0.5, 10])
  camera.azimuth = -20
  camera.elevation = -20
  camera.focus = [0, 0, 0]
  camera.update()

  AngleCameraController.init(canvas, camera)

  const matP = Matrix4.perspective(camera.fov, canvas.width / canvas.height, camera.near, camera.far)
  const matM = Matrix4.identity()

  uniforms.init(program.get())
  uniforms.fmatrix4("uMatModel", matM.values)
  uniforms.fmatrix4("uMatProj", matP.values)
  uniforms.fmatrix4("uMatNormal", matM.inverse().values)
  uniforms.fvector3("uLightDir", [-0.5, 0.5, 200])
  uniforms.fvector3("uMaterialColor", uMaterialColor)
  uniforms.fvector4("uAmbient", [0.2, 0.1, 0.2, 1.0])

  gl.clearColor(0.98, 0.969, 0.941, 1.0)
  gl.clearDepth(1.0)

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.enable(gl.CULL_FACE)

  return {
    drawOnFrame() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      const matV = camera.View
      uniforms.fmatrix4("uMatView", matV.values)

      rabbit.bind()
      rabbit.draw()
    },
    control(ui) {
      ui.rgb("Color", uMaterialColor, (c) => {
        uniforms.fvector3("uMaterialColor", c)
      })
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fitSquare: true,
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
