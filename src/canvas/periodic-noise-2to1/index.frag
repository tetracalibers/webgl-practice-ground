#version 300 es

precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 fragColor;

// 円周率
const float PI = 3.1415926;

// atan を x = 0 上でも定義した拡張版
// tan(y) = x となるy（偏角）を(-PI, PI]の範囲で返す
float atan2(float y, float x) {
  // x = 0 の場合、点 (x, y) はy軸上
  // => つまり、偏角は 90° か -90° で、yの符号によって決まる
  return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

// 直交座標 (x, y) -> 極座標 (偏角s, 動径t)
vec2 xy2pol(vec2 xy) {
  return vec2(atan2(xy.y, xy.x), length(xy));
}

// 算術積に使う大きな桁数の定数
uint k = 0x456789abu;

// 符号なし整数の1dハッシュ関数
uint uhash11(uint n) {
  n ^= (n << 1);
  n ^= (n >> 1);
  n *= k;
  n ^= (n << 1);
  return n * k;
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
  uint ind = (uhash11(uhash11(n.x) + n.y) >> 29);
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

// 周期的なノイズ
// ハッシュ値は周期periodの個数だけ循環して現れる
float periodicNoise21(vec2 p, float period) {
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
  float dh0 = gtable2(mod(p0, period), d0);
  float dh1 = gtable2(mod(p1, period), d1);
  float dh2 = gtable2(mod(p2, period), d2);
  float dh3 = gtable2(mod(p3, period), d3);
  
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
  
  pos = 2.0 * pos.xy - vec2(1.0);
  pos = xy2pol(pos);
  pos = vec2(5.0 / PI, 5.0) * pos + uTime;
  
  float noise = periodicNoise21(pos, 10.0);
  
  fragColor = vec4(vec3(noise), 1.0);
}