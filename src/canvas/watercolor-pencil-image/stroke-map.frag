#version 300 es

precision highp float;

// 円周率
const float PI = 3.1415926;

uniform sampler2D uTexture1;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 edge = texture(uTexture1, texCoord).rgb;
  
  float dx = dFdx(edge.r);
  float dy = dFdy(edge.r);
  
  float magnitude = length(vec2(dx, dy));
  
  // 8方向に量子化
  float dir8 = 0.5 / sin(PI / 8.0);
  vec2 quantized = floor((vec2(dx, dy) / magnitude) * dir8 + 0.5);
  
  // 90度回転
  dx = -quantized.y;
  dy = quantized.x;

  fragColor = vec4(dx, dy, magnitude, 1.0);
}