#version 300 es

precision highp float;

const float PI = 3.1415926;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// 正規化
float norm(float v, float minV, float maxV) {
  return (v - minV) / (maxV - minV);
}

// 範囲変換
float map(float v, float inMin, float inMax, float outMin, float outMax) {
  return mix(outMin, outMax, norm(v, inMin, inMax));
}

// fork from https://www.shadertoy.com/view/MsS3Wc
vec3 hsv2rgb(vec3 color) {
  // Hueを[0, 1]から[0, 6]へスケール
  float hue = color.x * 6.0;
  
  vec3 m = mod(hue + vec3(0.0, 4.0, 2.0), 6.0);
  vec3 a = abs(m - 3.0);
  vec3 rgb = clamp(a - 1.0, 0.0, 1.0);
    
  // 白とrgbを彩度（動径）に沿って補間したものに明度をかける
  return color.z * mix(vec3(1.0), rgb, color.y);
}

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// 擬似カラー
// 暗い色を青に、明るい色を赤に
vec3 toPseudoColor(float gray) {
  float hue = map(gray, 0.0, 1.0, float(240.0 / 360.0), 0.0);
  vec3 hsv = vec3(hue, 1.0, 1.0);
  return hsv2rgb(hsv);
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform bool uPseudoOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  vec3 pseudo = uPseudoOn
    ? toPseudoColor(toMonochrome(original.rgb))
    : original.rgb;
  
  fragColor = vec4(pseudo, original.a);
}