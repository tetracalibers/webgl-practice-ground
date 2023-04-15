export const equilateralTriangle = (size: number, position: [number, number]) => {
  const angle = Math.PI / 3 // 60度
  const height = (size * Math.sqrt(3)) / 2
  const vertices = [
    position[0],
    position[1] + height / 3,
    0.0,
    position[0] - size * Math.cos(angle),
    position[1] - (height * 2) / 3,
    0.0,
    position[0] + size * Math.cos(angle),
    position[1] - (height * 2) / 3,
    0.0
  ]
  return {
    vertices,
    indices: [0, 1, 2]
  }
}
