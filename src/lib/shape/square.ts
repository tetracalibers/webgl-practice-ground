// prettier-ignore
export const square = (size: number) => {
  // 頂点座標データ
  const vertices = [
    // x, y, z
    -size / 2, -size / 2, 0, // 左下
     size / 2, -size / 2, 0, // 右下
     size / 2,  size / 2, 0, // 右上
    -size / 2,  size / 2, 0, // 左上
  ];

  // 頂点ごとのテクスチャ座標データ
  const texCoords = [
    0, 0, // 左下
    1, 0, // 右下
    1, 1, // 右上
    0, 1, // 左上
  ];

  // 頂点インデックスデータ
  const indices = [
    0, 1, 2, // 三角形1: 左下 → 右下 → 右上
    0, 2, 3, // 三角形2: 左下 → 右上 → 左上
  ];

  return { vertices, indices, texCoords }
}
