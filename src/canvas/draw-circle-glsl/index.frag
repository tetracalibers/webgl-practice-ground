#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

// 円 f(x, y) = length(xy, center) - radius の距離関数
float circleSdf(vec2 xy, vec2 center, float radius) {
  vec2 fromCenter = xy - center;
  // dot(c, c) = ||c|| * ||c|| * cos(0) = ||c||^2 = length(c)^2
  // pow(dot(c, c), 0.5) = length(c)^2^0.5 = length(c)^(2 * 0.5) = length(c)
  return pow(dot(fromCenter, fromCenter), 0.5) - radius;
}

// 塗りつぶされた円
float circle(vec2 xy, vec2 center, float radius, float spread) {
  float sdf = circleSdf(xy, center, radius);
  return smoothstep(radius - radius * spread, radius + radius * spread, sdf);
}

void main() {
  // ビューポートの中心を原点として [0, 1] -> [-1, 1] にスケール
  // @see https://docs.google.com/presentation/d/12RrqyAkFanKmfL96ZHvhDCozE-_rKFPlU1YVwej4_bc/htmlpresent
  // * min = x なら、 2.0 * gl_FragCoord.xy / x - [1, y / x]
  // * min = y なら、 2.0 * gl_FragCoord.xy / y - [x / y, 1]
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (2.0 * uMouse.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  mouse.y *= -1.0;
  
  // 1.0から引くことで、円の中と円の外の白黒逆転
  outColor.rgb = vec3(1.0 - circle(pos, mouse, 0.3, 0.005));
  outColor.a = 1.0;
}