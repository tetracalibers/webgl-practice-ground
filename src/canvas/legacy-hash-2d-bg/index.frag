#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 2Dのレガシー乱数
// * xyは正規化された座標
float fractSin21(vec2 xy) {
  // 正規化したフラグメント座標に内積による比重を与えて足し、
  // そのsin値に大きな値をかけて小数点をとる
  return fract(sin(dot(xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる
  pos += floor(60.0 * uTime);
  
  // フラグメント座標を正規化
  pos = pos.xy / uResolution.xy;
  
  outColor = vec4(vec3(fractSin21(pos.xy)), 1.0);
}