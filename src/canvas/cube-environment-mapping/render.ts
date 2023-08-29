import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { Uniforms, Program } from "sketchgl/program"
import { Matrix4, Vector3 } from "sketchgl/math"
import { MouseCoords } from "sketchgl/interactive"
import { ImagesCubeTexture } from "sketchgl/texture"
import { Cube, Icosahedron, Sphere } from "sketchgl/geometry"

import vert from "./index.vert?raw"
import frag from "./index.frag?raw"

import top from "@/assets/cube-map/sky/top.png"
import bottom from "@/assets/cube-map/sky/bottom.png"
import left from "@/assets/cube-map/sky/left.png"
import right from "@/assets/cube-map/sky/right.png"
import front from "@/assets/cube-map/sky/front.png"
import back from "@/assets/cube-map/sky/back.png"

const sketch: SketchFn = ({ gl, canvas }) => {
  const uniforms = new Uniforms(gl, ["uMatView", "uMatModel", "uMatProj", "uEyePosition", "uReflection"])
  const matP = Matrix4.perspective(45, canvas.width / canvas.height, 0.1, 200)

  const program = new Program(gl)
  program.attach(vert, frag)
  program.activate()

  uniforms.init(program.raw)
  uniforms.fmatrix4("uMatProj", matP.values)

  const polyhedron = new Icosahedron(gl)
  polyhedron.setLocations({ vertices: 0, normals: 1 })

  const sphere = new Sphere(gl, { radius: 1, segments: 64, rings: 64 })
  sphere.setLocations({ vertices: 0, normals: 1 })

  const cube = new Cube(gl, { size: 2 })
  cube.setLocations({ vertices: 0, normals: 1 })

  const cubeMap = new ImagesCubeTexture(gl, { top, bottom, left, right, front, back })
  const mouse = new MouseCoords(canvas)

  let count = 0

  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clearDepth(1.0)

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  return {
    preload: [cubeMap.load()],

    drawOnFrame: () => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      count++
      const rad = ((count % 360) * Math.PI) / 180
      const rad2 = (((count + 180) % 360) * Math.PI) / 180

      const rot = mouse.quaternion()
      const eye = rot.toRotatedVector3(0, 0, 8)
      const up = rot.toRotatedVector3(0, 1, 0)

      const matV = Matrix4.view(eye, new Vector3(0, 0, 0), up)
      uniforms.fmatrix4("uMatView", matV.values)

      // 背景用キューブ
      cube.bind()
      let matM = Matrix4.scaling(100, 100, 100)
      uniforms.fmatrix4("uMatModel", matM.values)
      uniforms.fvector3("uEyePosition", eye.rawValues)
      uniforms.bool("uReflection", false)
      cubeMap.activate(program.raw, "uCubeMap")
      cube.draw({ primitive: "TRIANGLES" })

      // 球
      sphere.bind()
      matM = Matrix4.rotationZ(rad).translate(2, 0, 0)
      uniforms.fmatrix4("uMatModel", matM.values)
      uniforms.bool("uReflection", true)
      sphere.draw({ primitive: "TRIANGLES" })

      // 多面体
      polyhedron.bind()
      matM = Matrix4.rotationZ(rad2).translate(2, 0, 0)
      uniforms.fmatrix4("uMatModel", matM.values)
      uniforms.bool("uReflection", true)
      polyhedron.draw({ primitive: "TRIANGLES" })
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
