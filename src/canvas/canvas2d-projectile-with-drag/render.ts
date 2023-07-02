import type { Vector2 } from "@/lib/math/vector"
import { Ball } from "@/lib/canvas/shape/ball"
import { Timer } from "@/lib/control/timer"
import { Clock } from "@/lib/event/clock"
import { Forces } from "@/lib/physics/forces"

export const onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas")
  const context = canvas.getContext("2d")
  if (!context) return

  let loopClock: Clock
  let timer: Timer

  let ball: Ball
  let force: Vector2
  let acceleration: Vector2
  let dt = 0

  const setupBackground = () => {
    context.beginPath()
    context.fillStyle = "#DEECFF"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    setupBackground()
  }

  const setupScene = () => {
    ball = new Ball({ radius: 20, color: "#95BDFF", isGradientOn: true })
    ball.position2d = { x: 50, y: 400 }
    ball.velocity2d = { x: 60, y: -60 }
    ball.draw(context)
  }

  // 移動
  const moveObject = () => {
    ball.position2d = ball.position2d.addScaled(ball.velocity2d, dt)
    clearCanvas()
    ball.draw(context)
  }

  // 力の更新
  const updateForce = () => {
    const gravity = Forces.constantGravity(ball.mass, 10)
    const drag = Forces.linearDrag(0.1, ball.velocity2d)
    force = Forces.add(gravity, drag)
  }

  // 加速度の更新
  const updateAccel = () => {
    acceleration = force.scale(1 / ball.mass)
  }

  // 速度の更新
  const updateVelocity = () => {
    ball.velocity2d = ball.velocity2d.addScaled(acceleration, dt)
  }

  // 全体の更新
  const updateScene = () => {
    moveObject()
    updateForce()
    updateAccel()
    updateVelocity()
  }

  const animationFrame = () => {
    dt = timer.elapsed * 0.001
    if (dt > 0.2) dt = 0
    timer.reset()

    updateScene()
  }

  const init = () => {
    setupBackground()
    setupScene()

    timer = new Timer()

    loopClock = new Clock()
    loopClock.on("tick", animationFrame)
  }

  init()
}
