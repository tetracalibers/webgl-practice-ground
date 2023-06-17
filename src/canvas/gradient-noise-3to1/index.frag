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

// 符号なし整数の3d => 3dハッシュ関数
uvec3 uhash33(uvec3 n){
  n ^= (n.yzx << u);
  n ^= (n.yzx >> u);
  n *= k;
  n ^= (n.yzx << u);
  return n * k;
}

// 浮動小数点数の3d => 3dハッシュ関数
vec3 hash33(vec3 p){
  // ビット列を符号なし整数に変換
  uvec3 n = floatBitsToUint(p);
  // 値の正規化
  return vec3(uhash33(n)) / vec3(UINT_MAX);
}

// 5次エルミート補間
vec3 hermite5(vec3 x) {
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// 勾配ノイズ（ 3 => 1 ）
float gnoise31(vec3 p) {
  // タイルの頂点
  vec3 p0 = floor(p);
  vec3 p1 = p0 + vec3(1.0, 0.0, 0.0);
  vec3 p2 = p0 + vec3(0.0, 1.0, 0.0);
  vec3 p3 = p0 + vec3(1.0, 1.0, 0.0);
  vec3 p4 = p0 + vec3(0.0, 0.0, 1.0);
  vec3 p5 = p4 + vec3(1.0, 0.0, 0.0);
  vec3 p6 = p4 + vec3(0.0, 1.0, 0.0);
  vec3 p7 = p4 + vec3(1.0, 1.0, 0.0);
  
  // タイルの各頂点のハッシュ値
  // 最終的に[0, 1]区間で値を返すため、[-0.5, 0.5]区間にずらしておく
  vec3 h0 = normalize(hash33(p0) - vec3(0.5));
  vec3 h1 = normalize(hash33(p1) - vec3(0.5));
  vec3 h2 = normalize(hash33(p2) - vec3(0.5));
  vec3 h3 = normalize(hash33(p3) - vec3(0.5));
  vec3 h4 = normalize(hash33(p4) - vec3(0.5));
  vec3 h5 = normalize(hash33(p5) - vec3(0.5));
  vec3 h6 = normalize(hash33(p6) - vec3(0.5));
  vec3 h7 = normalize(hash33(p7) - vec3(0.5));
  
  // タイル内のどの辺にいるか（小数部分）
  vec3 f = fract(p);
  
  // 各頂点からの距離
  vec3 d0 = f;
  vec3 d1 = f - vec3(1.0, 0.0, 0.0);
  vec3 d2 = f - vec3(0.0, 1.0, 0.0);
  vec3 d3 = f - vec3(1.0, 1.0, 0.0);
  vec3 d4 = f - vec3(0.0, 0.0, 1.0);
  vec3 d5 = f - vec3(1.0, 0.0, 1.0);
  vec3 d6 = f - vec3(0.0, 1.0, 1.0);
  vec3 d7 = f - vec3(1.0, 1.0, 1.0);
  
  // 各頂点からの距離とハッシュ値の内積
  float dh0 = dot(d0, h0);
  float dh1 = dot(d1, h1);
  float dh2 = dot(d2, h2);
  float dh3 = dot(d3, h3);
  float dh4 = dot(d4, h4);
  float dh5 = dot(d5, h5);
  float dh6 = dot(d6, h6);
  float dh7 = dot(d7, h7);
  
  // タイル内のどの辺にいるか（小数部分）によってエルミート補間
  vec3 w = hermite5(f);
  
  // z = 0 の面
  // (x, 0, 0)をx軸に沿って線形補間したものと、(x, 1, 0)をx軸に沿って線形補間したものを、y軸に沿って線形補間
  float z0 = mix(mix(dh0, dh1, w.x), mix(dh2, dh3, w.x), w.y);
  
  // z = 1 の面
  // (x, 0, 1)をx軸に沿って線形補間したものと、(x, 1, 1)をx軸に沿って線形補間したものを、y軸に沿って線形補間
  float z1 = mix(mix(dh4, dh5, w.x), mix(dh6, dh7, w.x), w.y);
  
  // z = 0 の面と z = 1 の面をz軸に沿って線形補間
  float i = mix(z0, z1, w.z);
  
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
  
  float noise = gnoise31(vec3(pos, uTime));
  
  fragColor = vec4(vec3(noise), 1.0);
}