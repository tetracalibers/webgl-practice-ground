#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

in vec2 vTextureCoords;

out vec4 outColor;

// 円 f(x, y) = length(xy, center) - radius の距離関数
float circleSdf(vec2 xy, vec2 center, float radius) {
  vec2 fromCenter = xy - center;
  // dot(c, c) = ||c|| * ||c|| * cos(0) = ||c||^2 = length(c)^2
  // pow(dot(c, c), 0.5) = length(c)^2^0.5 = length(c)^(2 * 0.5) = length(c)
  return pow(dot(fromCenter, fromCenter), 0.5) - radius;
}

// 塗りつぶされた円
vec4 circle(vec2 xy, vec2 center, float radius, float spread) {
  float sdf = circleSdf(xy, center, radius);
  float shape = smoothstep(radius - radius * spread, radius + radius * spread, sdf);
  
  return mix(vec4(1.0, 0.0, 1.0, 0.5), vec4(1.0, 0.0, 0.0, 0.0), shape);
}

void main() {
  vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
  pos *= 2.0;
  pos -= 1.0;
  vec2 mouse = uMouse.xy / min(uResolution.x, uResolution.y);
  mouse *= 2.0;
  mouse -= 1.0;
  mouse.y *= -1.0;
  
  outColor = circle(pos, mouse, 0.1, 0.005);
}