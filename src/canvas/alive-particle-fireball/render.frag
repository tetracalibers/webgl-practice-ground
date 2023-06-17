#version 300 es

precision highp float;

in vec2 vTexCoord;
in float vAge;
in float vLife;

out vec4 fragColor;

uniform sampler2D uSprite;

// @see https://iquilezles.org/articles/palettes/
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main(){
  // どれくらい古いか
  float t = vAge / vLife;
  // 古いほど透明にする
  vec4 color = vec4(1.0, 0.8, 0.3, 1.0 - t);
  
  fragColor = color * texture(uSprite, vTexCoord);
}