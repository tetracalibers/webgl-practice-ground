import { Space } from "@/lib/canvas/index"
import { Clock } from "@/lib/event/clock"
import { Timer } from "@/lib/control/timer"
import { SwapTransformFeedbackSprite } from "@/lib/webgl/swap-transform-feedback-sprite"
import { AliveParticlesSystem } from "@/lib/feature/particle/alive-particle"
import { UniformManager } from "@/lib/webgl/uniform-manager"
import { ImageTexture } from "@/lib/webgl/image-texture"

import vertForUpdate from "./update.vert?raw"
import fragForUpdate from "./update.frag?raw"

import vertForRender from "./render.vert?raw"
import fragForRender from "./render.frag?raw"

import sprite from "@/assets/datauri/fireball.txt?raw"

/**

## configure

1. 最大数パーティクルに必要なデータを保持するのに十分な大きさの、同じサイズの2つのバッファを作成
2. そのうちの1つを「読み取り」バッファーとして指定し、もう1つを「書き込み」バッファーとして指定
3. 「読み取り」バッファーにパーティクルシステムの初期状態を入力

## render

1. 「読み取り」バッファを入力としてバインドし、「書き込みバッファ」をTransformFeedbackバッファとしてバインド
2. updateプログラムを呼び出して、パーティクルの更新された状態をTransformFeedbackバッファに書き込み
3. 「書き込み」バッファを入力としてバインドし、Renderプログラムを呼び出して、パーティクルの更新された状態を画面上に表示
4. 「読み取り」バッファと「書き込み」バッファを交換

**/

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let clock: Clock
  let tf: SwapTransformFeedbackSprite
  let programForUpdate: WebGLProgram
  let programForRender: WebGLProgram
  let uniformsForUpdate: UniformManager
  let timer: Timer

  let particles: AliveParticlesSystem
  let spriteTexture: ImageTexture

  const particlesCount = 800
  const particleMinAge = 0.8
  const particleMaxAge = 0.9

  // パーティクルシステムの初期状態を表すデータをインタリーブ配列として生成
  // 最初に1回GPUに送信され、以降はUpdateシェーダーによって更新される
  const initialParticleData = (count: number, minAge: number, maxAge: number) => {
    const data: number[] = []
    for (let i = 0; i < count; ++i) {
      // position
      data.push(0.0)
      data.push(0.0)

      const life = minAge + Math.random() * (maxAge - minAge)
      // age
      data.push(life + 1)
      data.push(life)

      // velocity
      data.push(0.0)
      data.push(0.0)
    }
    return data
  }

  const onResize = () => {
    space.fitScreen()
    render()
  }

  const configure = async () => {
    space.fitScreen()

    timer = new Timer()

    tf = new SwapTransformFeedbackSprite(gl)

    // varyingsはインタリーブ配列と同じ順で
    programForUpdate = tf.createProgram(vertForUpdate, fragForUpdate, ["vPosition", "vAge", "vLife", "vVelocity"])!
    programForRender = tf.createProgram(vertForRender, fragForRender)!

    // インタリーブ配列と同じ順で
    tf.registUpdateAttrib(0, 2, "FLOAT") // aPosition
    tf.registUpdateAttrib(2, 1, "FLOAT") // aAge
    tf.registUpdateAttrib(3, 1, "FLOAT") // aLife
    tf.registUpdateAttrib(1, 2, "FLOAT") // aVelocity

    // インタリーブ配列と同じ順で
    tf.registRenderAttrib(0, 2, "FLOAT", 1) // aPosition
    tf.registRenderAttrib(1, 1, "FLOAT", 1) // aAge
    tf.registRenderAttrib(2, 1, "FLOAT", 1) // aLife

    tf.registSpriteAttrib(3, 2, "FLOAT") // aInstanceCoord
    tf.registSpriteAttrib(4, 2, "FLOAT") // aInstanceTexCoord

    const initialData = new Float32Array(initialParticleData(particlesCount, particleMinAge, particleMaxAge))
    const spriteData = new Float32Array([1, 1, 1, 1, -1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, -1, -1, 0, 0, 1, -1, 1, 0])

    tf.setupDataAndAttrib(initialData, spriteData)

    particles = new AliveParticlesSystem(canvas, initialData.length / 6)
    particles.gravity = [0, 0]
    particles.minSpeed = 0.1
    particles.maxSpeed = 0.5

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    uniformsForUpdate = new UniformManager(gl, programForUpdate)
    uniformsForUpdate.init([
      "uTime",
      "uTimeDelta",
      "uGravity",
      "uOrigin",
      "uMinTheta",
      "uMaxTheta",
      "uMinSpeed",
      "uMaxSpeed"
    ])

    spriteTexture = new ImageTexture(gl, sprite)
    spriteTexture.MAG_FILTER = "LINEAR"
    spriteTexture.MIN_FILTER = "LINEAR"
    await spriteTexture.load()

    clock = new Clock()

    timer.start()
    space.onResize = onResize
  }

  const render = () => {
    const timeDelta = timer.elapsed

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.useProgram(programForUpdate)

    uniformsForUpdate.float("uTime", timer.totalTime)
    uniformsForUpdate.float("uTimeDelta", timeDelta * 0.001)
    uniformsForUpdate.fvector2("uGravity", particles.gravity)
    uniformsForUpdate.fvector2("uOrigin", particles.origin)
    uniformsForUpdate.float("uMinTheta", particles.minTheta)
    uniformsForUpdate.float("uMaxTheta", particles.maxTheta)
    uniformsForUpdate.float("uMinSpeed", particles.minSpeed)
    uniformsForUpdate.float("uMaxSpeed", particles.maxSpeed)

    tf.startUpdate()
    gl.drawArrays(gl.POINTS, 0, particles.alives)
    tf.endUpdate()

    gl.useProgram(programForRender)

    spriteTexture.activate(programForRender, "uSprite")

    tf.startRender()
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, particles.alives)
    tf.endRender()

    timer.update()
    particles.updateForNext(timeDelta)
  }

  const init = async () => {
    await configure()
    clock.on("tick", render)
  }

  init()
}
