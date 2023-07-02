import { Ball, Xy } from "@/lib/canvas/shape/ball"
import { Timer } from "@/lib/control/timer"
import { Clock } from "@/lib/event/clock"
import { Vector2 } from "@/lib/math/vector"

export const onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas")
  const context = canvas.getContext("2d")
  if (!context) return

  let loopClock: Clock
  let timer: Timer

  let balls: Ball[] = []
  let dt = 0

  const setupBackground = () => {
    context.beginPath()
    context.fillStyle = "#9EA9F0"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    setupBackground()
  }

  const setupBall = (color: string, position: Xy, velocity: Xy) => {
    const ball = new Ball({ radius: 20, color, isGradientOn: true })
    ball.position2d = position
    ball.velocity2d = velocity
    ball.draw(context)
    balls.push(ball)
  }

  const setupScene = () => {
    setupBall("#95BDFF", { x: 50, y: 200 }, { x: 30, y: 0 })
    setupBall("#F7C8E0", { x: 500, y: 200 }, { x: -20, y: 0 })
    setupBall("#C9F4AA", { x: 300, y: 200 }, { x: 10, y: 0 })
  }

  const moveObject = (ball: Ball) => {
    // v = dx / dt
    // i.e.
    // dx = v * dt
    ball.position2d = ball.position2d.addScaled(ball.velocity2d, dt)
    ball.draw(context)
  }

  const checkCollision = () => {
    for (let i = 0; i < balls.length; i++) {
      const ball_1 = balls[i]
      for (let j = i + 1; j < balls.length; j++) {
        const ball_2 = balls[j]
        const distance = Vector2.distance(ball_1.position2d, ball_2.position2d)
        // 衝突したら（2つの粒子の中心間の距離が半径の合計以下の場合）
        if (distance < ball_1.radius + ball_2.radius) {
          // 2つの粒子の速度を交換
          ;[ball_1.velocity2d, ball_2.velocity2d] = [ball_2.velocity2d, ball_1.velocity2d]
        }
      }
    }
  }

  const updateScene = () => {
    clearCanvas()
    checkCollision()
    balls.forEach((ball) => moveObject(ball))
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
