#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

// form from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
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

float posterizeHue(float hue, int level) {
  float hueStep = 255.0 / float(level - 1);
  
  // [0, 1]範囲へスケール
  float newHue = hue / 360.0;
  
  newHue = floor(newHue / hueStep + 0.5) * hueStep;
  newHue *= 360.0 / 255.0;
  
  newHue = newHue >= 360.0 ? newHue - 360.0 : newHue;
  newHue = newHue < 0.0 ? newHue + 360.0 : newHue;
  
  return newHue;
}

float posterizeColorRatio(float ratio, int level) {
  float ratioStep = 255.0 / float(level - 1);
  
  float newRatio = floor(ratio / ratioStep + 0.5) * ratioStep;
  newRatio /= 255.0;
  
  return newRatio;
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

vec3 applyKernelXY(sampler2D tex, vec2 texelSize, vec2 center, float[9] kernelX, float[9] kernelY) {
  vec2[9] offset = offset3x3(texelSize);
  
  float dx = 0.0;
  float dy = 0.0;
  
  vec3 color;
  float el;
  
  for (int i = 0; i < 9; i++) {
    color = offsetLookup(tex, center, offset[i]);
    el = rgb2hsv(color).b; // 明度
    
    dx += el * kernelX[i];
    dy += el * kernelY[i];
  }
  
  float result = length(vec2(dx, dy));
  
  return vec3(result);
}

uniform sampler2D uTexture0;
uniform float uThreshEdge;
uniform float uGamma;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;
uniform int uLevelH;
uniform int uLevelS;
uniform int uLevelB;
uniform bool uGrayScaleOn;

const vec3 minDensity = vec3(0.5, 0.3, 0.3);

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec3 inputColor = texture(uTexture0, texCoord).rgb;
  
  /* Layer. 1 ----------------------------------- */
  
  // 輝度調整
  vec3 layer1 = pow(inputColor, vec3(uGamma));
  
  vec3 hsv = rgb2hsv(layer1) * 255.0;
  
  // HSVによる階調数低減
  hsv.r = uLevelH == 1 ? uHue : posterizeHue(hsv.r, uLevelH);
  hsv.g = uLevelS == 1 ? uSaturation : posterizeColorRatio(hsv.g, uLevelS);
  hsv.b = uLevelB == 1 ? uBrightness : posterizeColorRatio(hsv.b, uLevelB);
  
  layer1 = hsv2rgb(hsv / 255.0);
  layer1 = mix(layer1, vec3(1.0), minDensity);
  
  /* Layer. 2 ----------------------------------- */
  
  // prewittフィルタ
  float[9] kernelX = float[](
    -1.0, 0.0, 1.0,
    -1.0, 0.0, 1.0,
    -1.0, 0.0, 1.0
  );
  float[9] kernelY = float[](
    -1.0, -1.0, -1.0,
    0.0, 0.0, 0.0,
    1.0, 1.0, 1.0
  );
  
  // エッジ抽出
  vec3 layer2 = applyKernelXY(uTexture0, texelSize, texCoord, kernelX, kernelY);
  
  // 反転
  layer2 = vec3(1.0) - layer2;
  
  // 二値化
  layer2 = step(uThreshEdge, layer2);
  layer2 = max(layer2, minDensity);
  
  /* Composite ---------------------------------- */
  
  // 合成
  vec3 outColor = layer1 * layer2;
  
  // グレースケール化
  outColor = uGrayScaleOn ? vec3(toMonochrome(outColor)) : outColor;
  
  fragColor = vec4(outColor, 1.0);
}