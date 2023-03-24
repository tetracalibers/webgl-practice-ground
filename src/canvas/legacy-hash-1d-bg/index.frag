#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 1Dのレガシー乱数
float fractSin11(float x) {
  // 小数点第4位以下の部分を乱数とする
  return fract(1000.0 * sin(x));
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる
  pos += floor(60.0 * uTime);
  
  outColor = vec4(vec3(fractSin11(pos.x)), 1.0);
}