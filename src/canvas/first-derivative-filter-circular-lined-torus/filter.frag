#version 300 es

precision highp float;

// NTSC系加重平均法と呼ばれるグレイスケール変換に使われる手法に則った係数
const float monoR = 0.298912;
const float monoG = 0.586611;
const float monoB = 0.114478;
const vec3 monochromeScale = vec3(monoR, monoG, monoB);

uniform sampler2D uTexture0;
uniform float uKernelX[9];
uniform float uKernelY[9];
uniform bool uUseFilter;
uniform bool uMonoChrome;

in vec2 vTextureCoords;

out vec4 fragColor;

const int mode = 1;

void main() {
  vec2 offset[9];
  offset[0] = vec2(-1.0, -1.0);
  offset[1] = vec2( 0.0, -1.0);
  offset[2] = vec2( 1.0, -1.0);
  offset[3] = vec2(-1.0, 0.0);
  offset[4] = vec2( 0.0, 0.0);
  offset[5] = vec2( 1.0, 0.0);
  offset[6] = vec2(-1.0, 1.0);
  offset[7] = vec2( 0.0, 1.0);
  offset[8] = vec2( 1.0, 1.0);
  
  ivec2 textureSize = textureSize(uTexture0, 0);
  vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));
  
  vec2 center = gl_FragCoord.xy;
  
  vec3 horizonColor = vec3(0.0);
  vec3 verticalColor = vec3(0.0);
  
  vec4 finalColor = vec4(0.0);
  
  if (uUseFilter) {
    for (int i = 0; i < 9; i++) {
      vec2 offsetX = (center + offset[i]) * texelSize.x;
      vec2 offsetY = (center + offset[i]) * texelSize.y;
      horizonColor += texture(uTexture0, offsetX).rgb * uKernelX[i];
      verticalColor += texture(uTexture0, offsetY).rgb * uKernelY[i];
    }
    finalColor = vec4(sqrt(horizonColor * horizonColor + verticalColor * verticalColor), 1.0);
  } else {
    finalColor = texture(uTexture0, vTextureCoords);
  }
  
  if (uMonoChrome) {
    float grayColor = dot(finalColor.rgb, monochromeScale);
    finalColor = vec4(vec3(grayColor), 1.0);
  }
  
  fragColor = finalColor;
}