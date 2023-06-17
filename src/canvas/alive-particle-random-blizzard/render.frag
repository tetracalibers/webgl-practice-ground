#version 300 es

precision highp float;

in float vAge;
in float vLife;

out vec4 fragColor;

// @see https://iquilezles.org/articles/palettes/
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main(){
  // どれくらい古いか
  float t = vAge / vLife;
  
  // いい感じのグラデーションを作る
  vec3 outColor = palette(
    t,
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 1.0, 1.0),
    vec3(0.0, 0.1, 0.2)
  );
  
  // 古いほど透明にする
  fragColor = vec4(outColor, 1.0 - t);
}