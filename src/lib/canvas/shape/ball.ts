import { Vector2 } from "@/lib/math/vector"

interface BallOptions {
  radius: number
  color: string
  mass?: number
  charge?: number
  isGradientOn?: boolean
}

interface Xy {
  x: number
  y: number
}

export class Ball {
  private _radius: number
  private _color: string
  private _mass: number
  private _charge: number
  private _isGradientOn: boolean

  private _x = 0
  private _y = 0
  private _vx = 0
  private _vy = 0

  constructor(options: BallOptions) {
    const { radius, color, mass, charge, isGradientOn } = options
    this._radius = radius
    this._color = color
    this._mass = mass || 1
    this._charge = charge || 0
    this._isGradientOn = isGradientOn || false
  }

  get position2d(): Vector2 {
    return new Vector2(this._x, this._y)
  }

  set position2d(position: Xy) {
    this._x = position.x
    this._y = position.y
  }

  get velocity2d(): Vector2 {
    return new Vector2(this._vx, this._vy)
  }

  set velocity2d(velocity: Xy) {
    this._vx = velocity.x
    this._vy = velocity.y
  }

  get mass(): number {
    return this._mass
  }

  draw(context: CanvasRenderingContext2D) {
    if (this._isGradientOn) {
      const gradient = context.createRadialGradient(this._x, this._y, 0, this._x, this._y, this._radius)
      gradient.addColorStop(0, "#ffffff")
      gradient.addColorStop(1, this._color)
      context.fillStyle = gradient
    } else {
      context.fillStyle = this._color
    }

    context.beginPath()
    context.arc(this._x, this._y, this._radius, 0, Math.PI * 2, false)
    context.closePath()
    context.fill()
  }
}
