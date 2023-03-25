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

// 符号なし整数の3d => 3dハッシュ関数
uvec3 uhash33(uvec3 n){
  n ^= (n.yzx << u);
  n ^= (n.yzx >> u);
  n *= k;
  n ^= (n.yzx << u);
  return n * k;
}

// 浮動小数点数の3d => 1dハッシュ関数
float hash31(vec3 b) {
  // ビット列を符号なし整数に変換
  uvec3 n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash33(n).x) / float(UINT_MAX);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // 1秒間に60カウント
  float time = floor(60.0 * uTime);
  
  // フラグメント座標を時間変動させる
  pos += time;
  
  outColor.rgb = vec3(hash31(vec3(pos, time)));
  outColor.a = 1.0;
}