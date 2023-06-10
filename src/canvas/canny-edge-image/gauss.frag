#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// 正規分布（ガウス分布）
float gauss(float x, float sigma) {
  float s = sigma * sigma;
  return 1.0 / sqrt(2.0 * s) * exp(-x * x / (2.0 * s));
}

// Gaussianフィルタによる平滑化（横方向）
vec3 xGaussSmooth(sampler2D tex, vec2 uv, vec2 texelSize, float filterSize, float sigma) {
  float weights = 0.0;
  vec3 grad = vec3(0.0);
  
  float h = (filterSize - 1.0) / 2.0;
  
  for (float i = -h; i <= h; ++i) {
    float weight = gauss(i, sigma);
    vec2 offset = vec2(i * texelSize.x, 0.0);
    vec3 color = texture(tex, uv + offset).rgb;
    weights += weight;
    grad += color * weight;
  }
  
  return grad / weights;
}

// Gaussianフィルタによる平滑化（縦方向）
vec3 yGaussSmooth(sampler2D tex, vec2 uv, vec2 texelSize, float filterSize, float sigma) {
  float weights = 0.0;
  vec3 grad = vec3(0.0);
  
  float h = (filterSize - 1.0) / 2.0;
  
  for (float i = -h; i <= h; ++i) {
    float weight = gauss(i, sigma);
    vec2 offset = vec2(0.0, i * texelSize.y);
    vec3 color = texture(tex, uv + offset).rgb;
    weights += weight;
    grad += color * weight;
  }
  
  return grad / weights;
}

uniform sampler2D uTexture0;
uniform int uDirection; // 0: 水平方向, 1: 垂直方向
uniform int uFilterSize;
uniform float uSigma;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 outColor = uDirection == 0
    ? xGaussSmooth(uTexture0, texCoord, texelSize, float(uFilterSize), uSigma)
    : yGaussSmooth(uTexture0, texCoord, texelSize, float(uFilterSize), uSigma);
  
  outColor = uDirection == 1 ? vec3(toMonochrome(outColor)) : outColor;
  
  fragColor = vec4(outColor, 1.0);
}