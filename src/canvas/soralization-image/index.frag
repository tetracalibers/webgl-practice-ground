#version 300 es

precision highp float;

const float PI = 3.1415926;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// ソラリゼーション
vec3 soralize(vec3 color) {
  return 0.5 - 0.5 * cos(3.0 * PI * color);
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform bool uGrayScaleOn;
uniform bool uSoralizeOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  vec3 adapted = uGrayScaleOn ? vec3(toMonochrome(original.rgb)) : original.rgb;
  adapted = uSoralizeOn ? soralize(adapted) : adapted;
  
  fragColor = vec4(adapted, original.a);
}