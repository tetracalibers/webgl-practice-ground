import { hsvaToRgba } from "./color"

/**
 * トーラスを描画するための頂点データを生成
 *
 * @param {number} radius トーラスの半径
 * @param {number} tubeRadius 管の半径
 * @param {number} radialSegments トーラスの側面分割数
 * @param {number} tubularSegments 管の側面分割数
 * @param {number[]} rgbas RGBA色
 */
export const torus = (
  radius: number,
  tubeRadius: number,
  radialSegments: number,
  tubularSegments: number,
  rgbas?: number[]
) => {
  const vertices = []
  const normals = []
  const uvs = []
  const indices = []
  const colors = []

  for (let i = 0; i <= radialSegments; i++) {
    for (let j = 0; j <= tubularSegments; j++) {
      const theta = (i * Math.PI * 2) / radialSegments
      const phi = (j * Math.PI * 2) / tubularSegments

      const x = (radius + tubeRadius * Math.cos(theta)) * Math.cos(phi)
      const z = (radius + tubeRadius * Math.cos(theta)) * Math.sin(phi)
      const y = tubeRadius * Math.sin(theta)

      const u = i / tubularSegments
      const v = j / radialSegments

      vertices.push(x, y, z)
      normals.push(x - radius * Math.cos(theta), y - radius * Math.sin(theta), z)
      uvs.push(u, v)

      // 処理中の断面円の色
      const c = rgbas ?? hsvaToRgba((360 / tubularSegments) * j, 1, 1, 1)
      colors.push(...c)
    }
  }

  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const a = j * (tubularSegments + 1) + i
      const b = a + tubularSegments + 1
      const c = b + 1
      const d = a + 1

      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  return { vertices, normals, uvs, indices, colors }
}
