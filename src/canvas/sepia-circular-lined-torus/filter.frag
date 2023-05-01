#version 300 es

precision highp float;

// NTSC系加重平均法と呼ばれるグレイスケール変換に使われる手法に則った係数
const float monoR = 0.298912;
const float monoG = 0.586611;
const float monoB = 0.114478;
const vec3 monochromeScale = vec3(monoR, monoG, monoB);

// セピアは、RGBで表すと(107, 74, 43)
// 全てのフラグメントをグレイスケール化した後で、上記のRGBの比率に各フラグメントの値を調整
const float sepiaR = 1.07;
const float sepiaG = 0.74;
const float sepiaB = 0.43;
const vec3 sepiaScale = vec3(sepiaR, sepiaG, sepiaB);

uniform sampler2D uTexture0;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec4 smpColor = texture(uTexture0, vTextureCoords);
  
  float grayColor = dot(smpColor.rgb, monochromeScale);
  vec3 sepiaColor = vec3(grayColor) * sepiaScale;
  
  fragColor = vec4(sepiaColor, 1.0);
}