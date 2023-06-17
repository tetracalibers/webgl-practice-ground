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

// 5次エルミート補間
vec2 hermite5(vec2 x) {
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// 勾配ノイズ
float gnoise21(vec2 p) {
  // タイルの頂点
  vec2 p0 = floor(p);
  vec2 p1 = p0 + vec2(1.0, 0.0);
  vec2 p2 = p0 + vec2(0.0, 1.0);
  vec2 p3 = p0 + vec2(1.0, 1.0);
  
  // タイルの各頂点のハッシュ値
  // 最終的に[0, 1]区間で値を返すため、[-0.5, 0.5]区間にずらしておく
  vec2 h0 = normalize(hash22(p0) - vec2(0.5));
  vec2 h1 = normalize(hash22(p1) - vec2(0.5));
  vec2 h2 = normalize(hash22(p2) - vec2(0.5));
  vec2 h3 = normalize(hash22(p3) - vec2(0.5));
  
  // タイル内のどの辺にいるか（小数部分）
  vec2 f = fract(p);
  
  // 各頂点からの距離
  vec2 d0 = f;
  vec2 d1 = f - vec2(1.0, 0.0);
  vec2 d2 = f - vec2(0.0, 1.0);
  vec2 d3 = f - vec2(1.0, 1.0);
  
  // 各頂点からの距離とハッシュ値の内積
  float s = dot(h0, d0);
  float t = dot(h1, d1);
  float u = dot(h2, d2);
  float v = dot(h3, d3);
  
  // タイル内のどの辺にいるか（小数部分）によってエルミート補間
  vec2 w = hermite5(f);
  
  // 線形補間
  float i = mix(mix(s, t, w.x), mix(u, v, w.x), w.y);
  
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
  
  fragColor = vec4(vec3(gnoise21(pos)), 1.0);
}