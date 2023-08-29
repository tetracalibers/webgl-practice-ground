import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { Uniforms, Program } from "sketchgl/program"
import { Matrix4, type RawVector3 } from "sketchgl/math"
import { AngleCamera, AngleCameraController } from "sketchgl/camera"
import { MRTRenderer } from "sketchgl/renderer"
import { Geometry, HalfCanvasCoverPolygon } from "sketchgl/geometry"

import vertCalc from "./calc.vert?raw"
import fragCalc from "./calc.frag?raw"
import vertPreview from "./preview.vert?raw"
import fragPreview from "./preview.frag?raw"

import bunny from "@/model/json/Bunny-LowPoly.json" assert { type: "json" }

const sketch: SketchFn = ({ gl, canvas }) => {
  const uniforms = {
    shape: new Uniforms(gl, [
      "uMatView",
      "uMatModel",
      "uMatProj",
      "uMatNormal",
      "uLightDir",
      "uAmbient",
      "uMaterialColor"
    ]),
    plane: new Uniforms(gl, ["uOffset"])
  }

  const program = new Program(gl)
  program.attach(vertPreview, fragPreview)

  const camera = new AngleCamera("ORBIT")
  camera.goHome([45, 30, 300])
  camera.azimuth = -5
  camera.elevation = 30
  camera.focus = [0, 0, 0]
  camera.update()

  AngleCameraController.init(canvas, camera)

  const renderer = new MRTRenderer(gl, canvas, vertCalc, fragCalc, { texCount: 4 })

  const planeOffsets = [
    [-0.5, -0.5, 0.0],
    [-0.5, 0.5, 0.0],
    [0.5, -0.5, 0.0],
    [0.5, 0.5, 0.0]
  ]
  let uMaterialColor: RawVector3 = [0.792, 0.824, 0.969]
  let matP = Matrix4.perspective(camera.fov, canvas.width / canvas.height, camera.near, camera.far)
  let matM: Matrix4
  let matV: Matrix4

  uniforms.shape.init(renderer.program.get())
  uniforms.plane.init(program.get())

  const shape = new Geometry(gl)
  shape.registAttrib("vertice", { location: 0, components: 3, buffer: new Float32Array(bunny.vertices.map(Number)) })
  shape.registAttrib("normal", { location: 1, components: 3, buffer: new Float32Array(bunny.normals.map(Number)) })
  shape.registIndices(new Uint16Array(bunny.indices))
  shape.setup()

  const plane = new HalfCanvasCoverPolygon(gl)
  plane.setLocations({ vertices: 0, uv: 1 })

  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clearDepth(1.0)

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.enable(gl.CULL_FACE)

  return {
    resize: [renderer.resize],

    drawOnFrame: () => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      renderer.switchToOffcanvas()
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      matV = camera.View
      uniforms.shape.fmatrix4("uMatView", matV.values)
      uniforms.shape.fmatrix4("uMatProj", matP.values)
      uniforms.shape.fvector3("uLightDir", [-0.5, 0.5, 200])
      uniforms.shape.fvector3("uMaterialColor", uMaterialColor)
      uniforms.shape.fvector4("uAmbient", [0.2, 0.1, 0.2, 1.0])

      shape.bind()

      matM = Matrix4.translation(-30, 30, -500)
      uniforms.shape.fmatrix4("uMatModel", matM.values)
      uniforms.shape.fmatrix4("uMatNormal", matM.inverse().values)
      shape.draw({ primitive: "TRIANGLES" })

      matM = Matrix4.translation(15, 15, 0)
      uniforms.shape.fmatrix4("uMatModel", matM.values)
      uniforms.shape.fmatrix4("uMatNormal", matM.inverse().values)
      shape.draw({ primitive: "TRIANGLES" })

      renderer.switchToCanvas(program)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      for (let i = 0; i < 4; ++i) {
        uniforms.plane.fvector3("uOffset", planeOffsets[i])
        renderer.useAsTexture(i, "uTexture", program.get())
        plane.bind()
        plane.draw({ primitive: "TRIANGLES" })
      }
    },

    control: (ui) => {
      ui.rgb("Color", uMaterialColor, (c) => {
        uMaterialColor = c
      })
    }
  }
}

export const onload = () => {
  const config: SketchConfig = {
    canvas: {
      el: "gl-canvas",
      fit: "square",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
