#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// ネガポジ反転
vec3 invertNP(vec3 color) {
  return vec3(1.0) - color;
}

// コントラストを上げる折れ線型トーンカーブ
vec3 toHighContrast(vec3 color, float scale) {
  return clamp(color * scale, 0.0, 1.0);
}

// コントラストを下げる
vec3 toLowContrast(vec3 color, float scale) {
  return invertNP(toHighContrast(invertNP(color), scale));
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform int uContrastTo; // 0 => high, 1 => low
uniform float uScale;
uniform bool uGrayScaleOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  vec3 adapted = uGrayScaleOn
    ? vec3(toMonochrome(original.rgb))
    : original.rgb;
  
  if (uContrastTo == 0) {
    adapted = toHighContrast(adapted, uScale);
  } else if (uContrastTo == 1) {
    adapted = toLowContrast(adapted, uScale);
  }
  
  fragColor = vec4(adapted, original.a);
}