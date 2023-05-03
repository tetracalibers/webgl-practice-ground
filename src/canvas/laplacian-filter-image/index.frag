#version 300 es

precision highp float;

// NTSC系加重平均法と呼ばれるグレイスケール変換に使われる手法に則った係数
const float monoR = 0.298912;
const float monoG = 0.586611;
const float monoB = 0.114478;
const vec3 monochromeScale = vec3(monoR, monoG, monoB);

uniform sampler2D uTexture0;
uniform float uKernel[9];
uniform bool uEdgeDetection;
uniform bool uMonoChrome;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
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
  
  vec2 center = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 finalColor = vec3(0.0);
  
  if (uEdgeDetection) {
    for (int i = 0; i < 9; i++) {
      finalColor += texture(uTexture0, center + offset[i]).rgb * uKernel[i];
    }
    finalColor = max(finalColor, 0.0);
  } else {
    finalColor = texture(uTexture0, vec2(vTextureCoords.x, 1.0 - vTextureCoords.y)).rgb;
  }
  
  if (uMonoChrome) {
    float grayColor = dot(finalColor.rgb, monochromeScale);
    finalColor = vec3(grayColor);
  }
  
  fragColor = vec4(finalColor, 1.0);
}