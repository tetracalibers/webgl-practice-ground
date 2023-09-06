#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

#pragma glslify: bilerp_colors4 = require('sketchgl/glsl/bilerp-colors4');

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  vec3 RED = vec3(1.0, 0.0, 0.0);
  vec3 GREEN = vec3(0.0, 1.0, 0.0);
  vec3 BLUE = vec3(0.0, 0.0, 1.0);
  vec3 YELLOW = vec3(1.0, 1.0, 0.0);
  vec3[4] colors4 = vec3[](RED, BLUE, GREEN, YELLOW);
  
  vec3 bilerpColor = bilerp_colors4(colors4, pos);
  
  outColor = vec4(bilerpColor, 1.0);
}