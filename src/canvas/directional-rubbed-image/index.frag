#version 300 es

precision highp float;

float clamp_range(float v, float minV, float maxV) {
  return v * (maxV - minV) + minV;
}

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uint k1 = 0x456789abu;

// 符号なし整数の1dハッシュ関数
uint uhash11(uint n) {
  n ^= (n << 1);
  n ^= (n >> 1);
  n *= k1;
  n ^= (n << 1);
  return n * k1;
}

// 浮動小数点数の1dハッシュ関数
float hash11(float b) {
  // ビット列を符号なし整数に変換
  uint n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash11(n)) / float(UINT_MAX);
}

uniform sampler2D uOriginal;
uniform float uAlpha;
uniform float uMixingRatio;
uniform float uSiteCount;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 iTextureSize = textureSize(uOriginal, 0);
  vec2 textureSize = vec2(float(iTextureSize.x), float(iTextureSize.y));
  vec2 texelSize = 1.0 / textureSize;
  
  vec2 uv = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 original = texture(uOriginal, uv).rgb;
  
  vec2 pos = vec2(0.0);

  // ある方向に擦った感じにしたい場合、hash11を使う
  pos.x = clamp_range(hash11(uv.x), 0.0, texelSize.x);
  pos.y = clamp_range(hash11(uv.y), 0.0, texelSize.y);
  
  pos = fract(pos * uSiteCount);

  vec3 random = texture(uOriginal, uv + pos).rgb;
  
  vec3 outColor = mix(original, random, uMixingRatio);
  
  fragColor = vec4(outColor, uAlpha);
}