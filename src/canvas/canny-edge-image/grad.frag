#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// 円周率
const float PI = 3.1415926;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

uniform sampler2D uTexture0;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 gaussian = texture(uTexture0, texCoord);
  
  float dx = dFdx(gaussian.r);
  float dy = dFdy(gaussian.r);
  
  float magnitude = length(vec2(dx, dy));

  fragColor = vec4(dx, dy, magnitude, 1.0);
}