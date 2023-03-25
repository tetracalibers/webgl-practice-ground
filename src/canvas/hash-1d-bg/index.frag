#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 算術積に使う大きな桁数の定数
uint k = 0x456789abu;
// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 符号なし整数の1dハッシュ関数
uint uhash11(uint n) {
  n ^= (n << 1);
  n ^= (n >> 1);
  n *= k;
  n ^= (n << 1);
  return n * k;
}

// 浮動小数点数の1dハッシュ関数
float hash11(float b) {
  // ビット列を符号なし整数に変換
  uint n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash11(n)) / float(UINT_MAX);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる（1秒間に60カウント）
  pos += floor(60.0 * uTime);
  
  outColor = vec4(vec3(hash11(pos.x)), 1.0);
}