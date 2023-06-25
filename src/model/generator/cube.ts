import { hsvaToRgba } from "@/lib/shape/color"

export const generateCubeData = (size: number, rgbas: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0]) => {
  const half = size * 0.5
  const vertices = [
    -half,
    -half,
    half,
    half,
    -half,
    half,
    half,
    half,
    half,
    -half,
    half,
    half,
    -half,
    -half,
    -half,
    -half,
    half,
    -half,
    half,
    half,
    -half,
    half,
    -half,
    -half,
    -half,
    half,
    -half,
    -half,
    half,
    half,
    half,
    half,
    half,
    half,
    half,
    -half,
    -half,
    -half,
    -half,
    half,
    -half,
    -half,
    half,
    -half,
    half,
    -half,
    -half,
    half,
    half,
    -half,
    -half,
    half,
    half,
    -half,
    half,
    half,
    half,
    half,
    -half,
    half,
    -half,
    -half,
    -half,
    -half,
    -half,
    half,
    -half,
    half,
    half,
    -half,
    half,
    -half
  ]

  const normals = [
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0,
    1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0,
    1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
  ]

  const row = vertices.length / 3
  let colors = []
  for (let i = 0; i < row; i++) {
    const color_i = rgbas ? rgbas : hsvaToRgba((360 / row) * i, 1, 1, 1)
    colors.push(...color_i)
  }

  const texCoords = [
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 1.0
  ]

  const indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22,
    20, 22, 23
  ]

  return { vertices, normals, texCoords, indices, colors }
}
