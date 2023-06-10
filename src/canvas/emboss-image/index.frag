#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

vec2[9] offset3x3(vec2 texelSize) {
  vec2 offset[9];
  
  offset[0] = vec2(-texelSize.x, -texelSize.y);
  offset[1] = vec2( 0.0, -texelSize.y);
  offset[2] = vec2( texelSize.x, -texelSize.y);
  offset[3] = vec2(-texelSize.x, 0.0);
  offset[4] = vec2( 0.0, 0.0);
  offset[5] = vec2( texelSize.x, 0.0);
  offset[6] = vec2(-texelSize.x, texelSize.y);
  offset[7] = vec2( 0.0, texelSize.y);
  offset[8] = vec2( texelSize.x, 1.0);
  
  return offset;
}

vec3 offsetLookup(sampler2D tex, vec2 center, vec2 offset) {
  return texture(tex, center + offset).rgb;
}

vec3 applyKernel(sampler2D tex, vec2 texelSize, vec2 center, float[9] kernel) {
  vec2[9] offset = offset3x3(texelSize);
  
  vec3 result = vec3(0.0);
  
  for (int i = 0; i < 9; i++) {
    result += offsetLookup(tex, center, offset[i]) * kernel[i];
  }
  
  return result;
}

uniform sampler2D uTexture0;
uniform float uCoef;
uniform int uAngle;
uniform bool uGrayScaleOn;
uniform bool uSharpenOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
  int a = uAngle / 45;
  
  float[9] kernel = float[](
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0
  );
  
  if (a == 0) {
    kernel[0] = 2.0;
    kernel[4] = -1.0;
    kernel[8] = -1.0;
  } else if (a == 1) {
    kernel[1] = 2.0;
    kernel[4] = -1.0;
    kernel[7] = -1.0;
  } else if (a == 2) {
    kernel[2] = 2.0;
    kernel[4] = -1.0;
    kernel[6] = -1.0;
  } else if (a == 3) {
    kernel[5] = 2.0;
    kernel[4] = -1.0;
    kernel[3] = -1.0;
  } else if (a == 4) {
    kernel[8] = 2.0;
    kernel[4] = -1.0;
    kernel[0] = -1.0;
  } else if (a == 5) {
    kernel[7] = 2.0;
    kernel[4] = -1.0;
    kernel[2] = -1.0;
  } else if (a == 6) {
    kernel[6] = 2.0;
    kernel[4] = -1.0;
    kernel[2] = -1.0;
  } else if (a == 7) {
    kernel[3] = 2.0;
    kernel[4] = -1.0;
    kernel[5] = -1.0;
  }
  
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 outColor = applyKernel(uTexture0, texelSize, texCoord, kernel);
  
  outColor *= uCoef;
  outColor += uSharpenOn ? texture(uTexture0, texCoord).rgb : vec3(0.5);
  outColor = uGrayScaleOn ? vec3(toMonochrome(outColor)) : outColor;
  
  fragColor = vec4(outColor, 1.0);
}