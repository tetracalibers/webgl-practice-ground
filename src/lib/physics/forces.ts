import { Vector2 } from "../math/vector"

export class Forces {
  static zero(): Vector2 {
    return new Vector2(0, 0)
  }

  // 重力
  static constantGravity(mass: number, g = 9.8): Vector2 {
    return new Vector2(0, g * mass)
  }

  // 抗力
  static linearDrag(k: number, velocity: Vector2): Vector2 {
    const mag = velocity.magnitude
    const force = mag > 0 ? velocity.scale(-k) : new Vector2(0, 0)
    return force
  }

  static add(...forces: Vector2[]): Vector2 {
    return forces.reduce((acc, force) => acc.incrementBy(force), new Vector2(0, 0))
  }
}
