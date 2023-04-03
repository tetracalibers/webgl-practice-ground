#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

float grid(vec2 xy, float zoom) {
  vec2 cells = fract(xy * zoom);
  return step(zoom, cells.x) * step(zoom, cells.y);
}

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  pos.x *= uResolution.x / uResolution.y;
  
  // 大きな格子は縦に4つ並ぶ
  vec2 gridSpace = pos * 400.0;
  
  vec3 color = vec3(0.0);
  
  // 大きな格子
  color += vec3(0.0, 0.5, 0.5) * vec3(1.0 - grid(gridSpace, 0.01));
  // 大きな格子の各セルを(2, 2)分割する格子
  // * 0.02 = 0.01 * 2
  color += vec3(0.5, 0.0 ,0.5) * vec3(1.0 - grid(gridSpace, 0.02));
  // さらに各セルを(5, 5)分割する格子
  // * 0.1 = 0.02 * 5
  color += vec3(0.0, 0.2, 0.3) * vec3(1.0 - grid(gridSpace, 0.1));
  
  outColor.rgb = color;
  outColor.a = 1.0;
}
