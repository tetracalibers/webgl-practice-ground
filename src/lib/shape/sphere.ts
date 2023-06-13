import { hsvaToRgba } from "./color"

/**
 * @param {number} radius 球の半径
 * @param {number} segments 断面円をいくつの頂点で表現するのか
 * @param {number} rings 球をいくつの円で分割するのか
 * @param {number[]} rgbas RGBA色
 */
export const sphere = (radius: number, segments: number, rings: number, rgbas?: [number, number, number, number]) => {
  const vertices = []
  const indices = []
  const normals = []
  const texCoords = []
  const colors = []

  for (let i = 0; i <= rings; i++) {
    const v = i / rings
    const phi = v * Math.PI

    for (let j = 0; j <= segments; j++) {
      const u = j / segments
      const theta = u * Math.PI * 2

      const x = Math.cos(theta) * Math.sin(phi)
      const y = Math.cos(phi)
      const z = Math.sin(theta) * Math.sin(phi)
      const uCoord = 1 - u
      const vCoord = 1 - v

      vertices.push(radius * x, radius * y, radius * z)
      normals.push(x, y, z)
      texCoords.push(uCoord, vCoord)

      const c = rgbas ?? hsvaToRgba((360 / segments) * j, 1, 1, 1)
      colors.push(...c)

      if (i < rings && j < segments) {
        const a = i * (segments + 1) + j
        const b = a + segments + 1

        indices.push(a, b, a + 1)
        indices.push(b, b + 1, a + 1)
      }
    }
  }

  return {
    vertices,
    indices,
    normals,
    texCoords,
    colors
  }
}
