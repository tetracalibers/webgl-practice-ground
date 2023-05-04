#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform int uDirection; // 0: 水平方向, 1: 垂直方向
uniform int uFilterSize;
uniform float uSigma;

in vec2 vTextureCoords;

out vec4 fragColor;

float gaussian(float target, float sigma) {
  float s = sigma * sigma;
  // 正規分布（ガウス分布）
  return 1.0 / sqrt(2.0 * s) * exp(-target * target / (2.0 * s));
}

void main() {
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
  vec2 texel = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  float center = (float(uFilterSize) - 1.0) * 0.5;
  
  float sum = 0.0;
  
  vec3 finalColor = vec3(0.0);
  
  for (int i = -uFilterSize; i <= uFilterSize; i++) {
    float target = float(i) - center;
    float weight = gaussian(target, uSigma);
    vec2 offset = uDirection == 0 ? vec2(target * texelSize.x, 0.0) : vec2(0.0, target * texelSize.y);
    vec2 coord = uDirection == 0 ? texel + offset : 1.0 - (texel + offset);
    
    sum += weight;
    finalColor += texture(uTexture0, coord).rgb * weight;
  }
  
  if (sum != 0.0) {
    finalColor /= sum;
  }
  
  fragColor = vec4(finalColor, 1.0);
}