import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { InterleavedInitialData } from "sketchgl/utility"
import { Timer } from "sketchgl/interactive"
import { SwapTFRenderer } from "sketchgl/renderer"
import { Uniforms } from "sketchgl/program"
import { AliveParticlesSystem } from "@/lib/feature/particle/alive-particle"

import vertForUpdate from "./update.vert?raw"
import fragForUpdate from "./update.frag?raw"

import vertForRender from "./render.vert?raw"
import fragForRender from "./render.frag?raw"

const sketch: SketchFn = ({ gl, canvas }) => {
  const particlesCount = 10000
  const particleMinAge = 1.01
  const particleMaxAge = 1.15

  const initialData = new InterleavedInitialData(() => {
    const life = particleMinAge + Math.random() * (particleMaxAge - particleMinAge)
    return {
      vPosition: [0, 0],
      vAge: life + 1,
      vLife: life,
      vVelocity: [0, 0]
    }
  })
  const interleaved = initialData.generate({ count: particlesCount })
  // TODO: ライブラリでうまいこと提供する
  // TODO: interleaved.length / 6 を隠蔽する
  const particles = new AliveParticlesSystem(canvas, interleaved.length / 6)

  const uniformsFor = {
    update: new Uniforms(gl, ["uTimeDelta", "uGravity", "uOrigin", "uMinTheta", "uMaxTheta", "uMinSpeed", "uMaxSpeed"])
  }

  const renderer = new SwapTFRenderer(gl, initialData.keys)

  renderer.attachUpdateProgram(vertForUpdate, fragForUpdate)
  renderer.attachRenderProgram(vertForRender, fragForRender)

  renderer.registUpdateAttrib("vPosition", { location: 0, components: 2 })
  renderer.registUpdateAttrib("vAge", { location: 1, components: 1 })
  renderer.registUpdateAttrib("vLife", { location: 2, components: 1 })
  renderer.registUpdateAttrib("vVelocity", { location: 3, components: 2 })

  renderer.registRenderAttrib("aPosition", { location: 0, components: 2 })
  renderer.registRenderAttrib("aAge", { location: 1, components: 1 })
  renderer.registRenderAttrib("aLife", { location: 2, components: 1 })

  renderer.setup(new Float32Array(interleaved))

  uniformsFor.update.init(renderer.glProgramForUpdate)

  const timer = new Timer()
  timer.start()

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  return {
    drawOnFrame() {
      const deltaTime = timer.elapsed

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      renderer.startUpdate()

      uniformsFor.update.float("uTimeDelta", deltaTime * 0.001)
      uniformsFor.update.fvector2("uGravity", particles.gravity)
      uniformsFor.update.fvector2("uOrigin", particles.origin)
      uniformsFor.update.float("uMinTheta", particles.minTheta)
      uniformsFor.update.float("uMaxTheta", particles.maxTheta)
      uniformsFor.update.float("uMinSpeed", particles.minSpeed)
      uniformsFor.update.float("uMaxSpeed", particles.maxSpeed)

      gl.drawArrays(gl.POINTS, 0, particles.alives)

      renderer.endUpdate()

      renderer.startRender()

      gl.drawArrays(gl.POINTS, 0, particles.alives)

      renderer.endRender()

      timer.update()
      particles.updateForNext(deltaTime)
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
