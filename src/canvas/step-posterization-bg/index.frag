#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

#pragma glslify: bilerp_colors4 = require('sketchgl/glsl/bilerp-colors4');

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  // フラグメント座標を正規化
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  vec3[4] colors4 = vec3[](
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 1.0, 0.0),
    vec3(1.0, 0.0, 1.0),
    vec3(1.0, 1.0, 1.0)
  );
  
  // 階調数
  float n = 6.0;
  
  // フラグメント座標範囲を[0, n]区間にスケール
  pos *= n;
  // フラグメント座標を階段化
  pos = floor(pos) + step(0.5, fract(pos));
  // フラグメント座標範囲を[0, 1]区間に正規化
  pos /= n;
  
  vec3 bilerpColor = bilerp_colors4(colors4, pos);
  
  outColor = vec4(bilerpColor, 1.0);
}