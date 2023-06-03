#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// ガンマ補正のトーンカーブ
vec3 gammaCurve(vec3 color, float gamma) {
  return pow(color, vec3(gamma));
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform float uGamma;
uniform bool uGrayScaleOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  vec3 adapted = uGrayScaleOn ? vec3(toMonochrome(original.rgb)) : original.rgb;
  adapted = gammaCurve(adapted, uGamma);
  
  fragColor = vec4(adapted, original.a);
}