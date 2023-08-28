#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の2d => 2dハッシュ関数
uvec2 uhash22(uvec2 n){
  n ^= (n.yx << u.xy);
  n ^= (n.yx >> u.xy);
  n *= k.xy;
  n ^= (n.yx << u.xy);
  return n * k.xy;
}

// 浮動小数点数の2d => 2dハッシュ関数
vec2 hash22(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return vec2(uhash22(n)) / vec2(UINT_MAX);
}

// 第一近傍距離による胞体ノイズ
float firstCellular(vec2 p) {
  // 最も近い格子点
  vec2 i = floor(p);
  // タイル内のどのあたりにいるか
  vec2 f = fract(p);
  
  // 最も近いものまでの距離
  float distMin = 1.0;
  
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      // (-1, -1) or (-1, 0) or (-1, 1) or
      // ( 0, -1) or ( 0, 0) or ( 0, 1) or
      // ( 1, -1) or ( 1, 0) or ( 1, 1)
      vec2 offset = vec2(float(x), float(y));
      // 隣接するタイル内のランダムな点
      vec2 neighbor = hash22(i + offset);
      // 隣接するタイル内のランダムな点までの距離
      float dist = distance(neighbor + offset, f);
      // distMinより近ければ更新
      distMin = min(distMin, dist);
    }
  }
  
  return distMin;
}

void main() {
  // x, yを同じ値で割ることで、画面の縦横比に応じて歪むことがなくなる
  vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
  
  // [0, 10]区間にスケール（10分割するため）
  pos *= 10.0;
  // 時間が経つにつれて移動
  pos += uTime;
  
  float noise = firstCellular(pos);
  
  fragColor = vec4(vec3(noise), 1.0);
}