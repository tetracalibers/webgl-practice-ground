#version 300 es

precision highp float;

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の2d => 2dハッシュ関数
uvec2 uhash22(uvec2 n){
  n ^= (n.yx << u.xy);
  n ^= (n.yx >> u.xy);
  n *= k.xy;
  n ^= (n.yx << u.xy);
  return n * k.xy;
}

// 浮動小数点数の2d => 1dハッシュ関数
float hash21(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash22(n).x) / float(UINT_MAX);
}

float hash21Clamp(vec2 b, float minV, float maxV) {
  return ((maxV - minV) * hash21(b)) + minV;
}

uniform sampler2D uTexture1; // edge
uniform sampler2D uTexture2; // stroke map
uniform sampler2D uTexture3; // posterized
uniform float uDepthStroke;
uniform bool uColored;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 posterized = texture(uTexture3, texCoord).rgb;
  vec4 edge = texture(uTexture1, texCoord);
  vec4 strokeMap = texture(uTexture2, texCoord);
  
  float lineColor = edge.r + hash21Clamp(texCoord, -uDepthStroke, uDepthStroke);
  
  vec3 pencil = vec3(edge) * vec3(lineColor);
  pencil = vec3(1.0) - pencil;
  
  vec3 outColor = uColored ? pencil * posterized : pencil;

  fragColor = vec4(outColor, 1.0);
}