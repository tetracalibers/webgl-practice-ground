#version 300 es

precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 fragColor;

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

// cos(PI / 8) = 0.92387953...
const float cos_pi_in_8 = 0.923879533;
// sin(PI / 8) = 0.38268343...
const float sin_pi_in_8 = 0.382683432;

// 格子点latticeを8通りの計算にランダムに対応させる
float gtable2(vec2 lattice, vec2 p){
  // ビット列に変換
  uvec2 n = floatBitsToUint(lattice);
  // 32桁のハッシュ値をシフトして、10進数の8桁（2進数の3桁）にする
  uint ind = uhash22(n).x >> 29;
  // 4より小さければx, そうでなければy
  float u = ind < 4u ? p.x : p.y;
  // 4より小さければy, そうでなければx
  float v = ind < 4u ? p.y : p.x;
  // 軸を避けるよう傾ける
  u *= cos_pi_in_8;
  v *= sin_pi_in_8;
  // 符号を決める
  // (ind & 1, ind & 2) は、(0, 0), (1, 0), (0, 2), (1, 2)の4通りを繰り返す
  // つまり、(+, +), (-, +), (+, -), (-, -)の4通りを繰り返す
  return ((ind & 1u) == 0u? u: -u) + ((ind & 2u) == 0u? v : -v);
}

// 5次エルミート補間
vec2 hermite5(vec2 x) {
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// パーリンノイズ
float pnoise21(vec2 p) {
  // タイルの頂点
  vec2 p0 = floor(p);
  vec2 p1 = p0 + vec2(1.0, 0.0);
  vec2 p2 = p0 + vec2(0.0, 1.0);
  vec2 p3 = p0 + vec2(1.0, 1.0);
  
  // タイル内のどの辺にいるか（小数部分）
  vec2 f = fract(p);
  
  // 各頂点からの距離
  vec2 d0 = f;
  vec2 d1 = f - vec2(1.0, 0.0);
  vec2 d2 = f - vec2(0.0, 1.0);
  vec2 d3 = f - vec2(1.0, 1.0);
  
  // 各頂点からの距離とハッシュ値の内積
  float dh0 = gtable2(p0, d0);
  float dh1 = gtable2(p1, d1);
  float dh2 = gtable2(p2, d2);
  float dh3 = gtable2(p3, d3);
  
  // タイル内のどの辺にいるか（小数部分）によってエルミート補間
  vec2 w = hermite5(f);
  
  // 線形補間
  float i = mix(mix(dh0, dh1, w.x), mix(dh2, dh3, w.x), w.y);
  
  // [0, 1]区間にスケール
  return i * 0.5 + 0.5;
}

void main() {
  // x, yを同じ値で割ることで、画面の縦横比に応じて歪むことがなくなる
  vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
  
  // [0, 10]区間にスケール
  pos *= 10.0;
  // 移動
  pos += uTime;
  
  float noise = pnoise21(pos);
  
  fragColor = vec4(vec3(noise), 1.0);
}