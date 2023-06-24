export const generateHalfCoverPolygonData = () => {
  return {
    vertices: [-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0],
    texCoord: [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0],
    indices: [0, 2, 1, 2, 3, 1]
  }
}
