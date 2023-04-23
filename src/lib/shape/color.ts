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

export const denormalizeColor = (color: [number, number, number, number]) => {
  return color.map((c) => c * 255)
}

export const normalizeColor = (color: [number, number, number, number]) => {
  return color.map((c) => c / 255)
}
