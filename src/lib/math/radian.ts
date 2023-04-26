import type { RawVector3 } from "./raw-vector"

export const toRad = (angle: number) => (angle * Math.PI) / 180

export const toRadMap3 = (angles: RawVector3): RawVector3 => {
  return [toRad(angles[0]), toRad(angles[1]), toRad(angles[2])]
}
