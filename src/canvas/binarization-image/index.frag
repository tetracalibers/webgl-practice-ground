#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// @see http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// 明度による2値化
float toBinaryByLuminance(vec3 rgb, float threshold) {
  // 明度
  float luminance = dot(rgb, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
  
  // luminance > threshold ? 1.0 : 0.0;
  return step(threshold, luminance);
}

// 彩度による2値化
float toBinaryBySaturation(vec3 rgb, float threshold) {
  // 彩度
  float saturation = max(rgb.r, max(rgb.g, rgb.b)) - min(rgb.r, min(rgb.g, rgb.b));
  
  // saturation > threshold ? 1.0 : 0.0;
  return step(threshold, saturation);
}

// 彩度と色相による2値化
float toBinaryBySaturationAndHue(vec3 rgb, float threshold, float maxHue, float minHue) {
  vec3 hsv = rgb2hsv(rgb);
  
  // 彩度
  float saturation = hsv.y;
  // 色相
  float hue = hsv.x;
  
  // saturation > threshold && hue < maxHue && hue > minHue ? 1.0 : 0.0;
  return step(threshold, saturation) * step(hue, maxHue) * step(minHue, hue);
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform int uBase; // 0 => 明度、1 => 彩度, 2 => 彩度と色相
// uBase == 0 の場合に使う
uniform float uThresholdL;
// uBase == 1 or 2 の場合に使う
uniform float uThresholdS;
// uBase == 2 の場合に使う
uniform float uMaxHue;
uniform float uMinHue;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  float binaryed = 0.0;
  
  if (uBase == 0) {
    binaryed = toBinaryByLuminance(original.rgb, uThresholdL);
  } else if (uBase == 1) {
    binaryed = toBinaryBySaturation(original.rgb, uThresholdS);
  } else if (uBase == 2) {
    binaryed = toBinaryBySaturationAndHue(original.rgb, uThresholdS, uMaxHue, uMinHue);
  }
  
  fragColor = vec4(vec3(binaryed), original.a);
}