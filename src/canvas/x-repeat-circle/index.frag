#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

float norm(float v, float min, float max) {
  return (v - min) / (max - min);
}

float map(float v, float min1, float max1, float min2, float max2) {
  return mix(min2, max2, norm(v, min1, max1));
}

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
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  pos *= 2.0;
  pos -= 1.0;
  
  float aspect = uResolution.x / uResolution.y;
  pos.x *= aspect;
  
  // 座標をスケール
  // 半径は変わらずなので、座標が拡大されると円は小さくなる
  // つまり、大きな数をかけるほど、円がたくさん並ぶ
  pos *= 5.0;
    
  // center.xは、0.5で正円となる（例えば、0.0だと、半円の繰り返しになってしまう）
  vec2 center = vec2(0.5, 0.0);
  
  // 1.0から引くことで、円の中と円の外の白黒逆転
  // fract(pos.x + 0.5)で横方向に繰り返す（+0.5は、原点を円の中心に合わせるため）
  outColor.rgb = vec3(1.0 - circle(vec2(fract(pos.x + 0.5), pos.y), center, 0.1, 0.1));
  outColor.a = 1.0;
}