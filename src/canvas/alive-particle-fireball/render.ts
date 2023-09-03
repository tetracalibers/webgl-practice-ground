import { SketchGl, type SketchConfig, type SketchFn } from "sketchgl"
import { InterleavedInitialData } from "sketchgl/utility"
import { AliveParticlesSystem } from "@/lib/feature/particle/alive-particle"
import { Timer } from "sketchgl/interactive"
import { SwapSpriteTFRenderer } from "sketchgl/renderer"
import { Uniforms } from "sketchgl/program"
import { ImageTexture } from "sketchgl/texture"

import vertForUpdate from "./update.vert?raw"
import fragForUpdate from "./update.frag?raw"

import vertForRender from "./render.vert?raw"
import fragForRender from "./render.frag?raw"

import sprite from "@/assets/datauri/fireball.txt?raw"

const sketch: SketchFn = ({ gl, canvas }) => {
  const particlesCount = 800
  const particleMinAge = 0.8
  const particleMaxAge = 0.9

  const interleave = new InterleavedInitialData(() => {
    const life = particleMinAge + Math.random() * (particleMaxAge - particleMinAge)
    return {
      vPosition: [0, 0],
      vAge: life + 1,
      vLife: life,
      vVelocity: [0, 0]
    }
  })
  const initialData = interleave.generate({ count: particlesCount })
  // TODO: どうにかしたい
  const spriteData = [1, 1, 1, 1, -1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, -1, -1, 0, 0, 1, -1, 1, 0]

  // TODO: ライブラリでうまいこと提供する
  // TODO: interleaved.length / 6 を隠蔽する
  const particles = new AliveParticlesSystem(canvas, initialData.length / 6)
  particles.gravity = [0, 0]
  particles.minSpeed = 0.1
  particles.maxSpeed = 0.5

  const uniformsFor = {
    update: new Uniforms(gl, ["uTimeDelta", "uGravity", "uOrigin", "uMinTheta", "uMaxTheta", "uMinSpeed", "uMaxSpeed"])
  }

  const renderer = new SwapSpriteTFRenderer(gl, interleave.keys)

  renderer.attachUpdateProgram(vertForUpdate, fragForUpdate)
  renderer.attachRenderProgram(vertForRender, fragForRender)

  renderer.registUpdateAttrib("vPosition", { location: 0, components: 2 })
  renderer.registUpdateAttrib("vAge", { location: 1, components: 1 })
  renderer.registUpdateAttrib("vLife", { location: 2, components: 1 })
  renderer.registUpdateAttrib("vVelocity", { location: 3, components: 2 })

  renderer.registRenderAttrib("aPosition", { location: 0, components: 2, divisor: 1 })
  renderer.registRenderAttrib("aAge", { location: 1, components: 1, divisor: 1 })
  renderer.registRenderAttrib("aLife", { location: 2, components: 1, divisor: 1 })

  renderer.registSpriteAttrib("aInstanceCoord", { location: 3, components: 2 })
  renderer.registSpriteAttrib("aInstanceTexCoord", { location: 4, components: 2 })

  renderer.setup(new Float32Array(initialData), new Float32Array(spriteData))

  uniformsFor.update.init(renderer.glProgramForUpdate)

  const spriteTexture = new ImageTexture(gl, sprite)
  spriteTexture.MAG_FILTER = "LINEAR"
  spriteTexture.MIN_FILTER = "LINEAR"

  const timer = new Timer()
  timer.start()

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  return {
    preload: [spriteTexture.load()],

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

      // TODO: renderer側でdrawメソッドを提供？
      gl.drawArrays(gl.POINTS, 0, particles.alives)

      renderer.endUpdate()
      renderer.startRender()

      spriteTexture.activate(renderer.glProgramForRender!, "uSprite")
      // TODO: renderer側でdrawメソッドを提供？
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, particles.alives)

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
      fit: "screen",
      autoResize: true
    }
  }
  SketchGl.init(config, sketch)
}
