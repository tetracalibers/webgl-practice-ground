#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

void main() {
  // 色に対応づけるため、[0, 1]範囲にしておく
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  // 分割数
  float nx = 4.0;
  float ny = 3.0;
  
  // 0 ～ nの範囲の小数部は、0 ～ 1の範囲をn回繰り返すという意味になる
  outColor = vec4(fract(pos.y * ny), fract(pos.x * nx), 1.0, 1.0);
}
