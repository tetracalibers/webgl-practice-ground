import type { RawVector3, RawVector4 } from "../math/raw-vector"

export const hsvaToRgba = (h: number, s: number, v: number, a: number): [number, number, number, number] => {
  let colors = []
  const th = h % 360
  // 整数部分と小数部分
  const i = Math.floor(th / 60)
  const F = th / 60 - i
  // よく現れる式を変数化
  const M = v * (1 - s)
  const N = v * (1 - s * F)
  const K = v * (1 - s * (1 - F))
  if (s === 0) {
    colors.push(v, v, v, a)
  } else {
    // rgb値算出
    const r = [v, N, M, M, K, v][i]
    const g = [K, v, v, N, M, M][i]
    const b = [M, M, K, v, v, N][i]
    colors.push(r, g, b, a)
  }

  return [colors[0], colors[1], colors[2], colors[3]]
}

export const denormalizeRgb = (r: number, g: number, b: number): RawVector3 => {
  return [r * 255, g * 255, b * 255]
}

export const denormalizeRgba = (r: number, g: number, b: number, a = 1.0): RawVector4 => {
  return [r * 255, g * 255, b * 255, a * 255]
}

export const normalizeRgb = (r: number, g: number, b: number): RawVector3 => {
  return [r / 255, g / 255, b / 255]
}

export const normalizeRgba = (r: number, g: number, b: number, a = 1.0): RawVector4 => {
  return [r / 255, g / 255, b / 255, a / 255]
}

export const toRgba = (color: number[]): RawVector4 => {
  return [color[0], color[1], color[2], color[3] ?? 1.0]
}
