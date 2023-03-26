#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

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

// 浮動小数点数の2d => 1dハッシュ関数
float hash21(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash22(n).x) / float(UINT_MAX);
}

float vnoise21(vec2 pos) {
  // タイルの原点
  vec2 origin = floor(pos);
  
  // タイルの各頂点のハッシュ値
  float corner00 = hash21(origin);
  float corner01 = hash21(origin + vec2(0.0, 1.0));
  float corner10 = hash21(origin + vec2(1.0, 0.0));
  float corner11 = hash21(origin + vec2(1.0));
  
  // タイル内のどの辺にいるか（小数部分）によって双線形補間
  vec2 f = fract(pos);
  return mix(mix(corner00, corner10, f.x), mix(corner01, corner11, f.x), f.y);
}

void main() {
  // x, yを同じ値で割ることで、画面の縦横比に応じて歪むことがなくなる
  vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
  
  // [0, 10]区間にスケール
  pos *= 10.0;
  // 移動
  pos += uTime;
  
  outColor.rgb = vec3(vnoise21(pos));
  outColor.a = 1.0;
}