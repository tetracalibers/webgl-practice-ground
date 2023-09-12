#version 300 es

precision highp float;

vec2 clamp_range(vec2 v, vec2 minV, vec2 maxV) {
  return v * (maxV - minV) + minV;
}

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;
// 算術積に使う大きな桁数の定数
uvec3 k2 = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の2d => 2dハッシュ関数
uvec2 uhash22(uvec2 n) {
  n ^= n.yx << u.xy;
  n ^= n.yx >> u.xy;
  n *= k2.xy;
  n ^= n.yx << u.xy;
  return n * k2.xy;
}

// 浮動小数点数の2d => 2dハッシュ関数
vec2 hash22(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return vec2(uhash22(n)) / vec2(UINT_MAX);
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

  // スプレー画のように満遍なくぼかしたい場合、hash22を使う
  // uSiteCountが小さいとクレヨンのように、大きいとスプレーのように見える
  vec2 pos = clamp_range(hash22(uv), vec2(0.0), texelSize);
  
  pos = fract(pos * uSiteCount);

  vec3 random = texture(uOriginal, uv + pos).rgb;
  
  vec3 outColor = mix(original, random, uMixingRatio);
  
  fragColor = vec4(outColor, uAlpha);
}