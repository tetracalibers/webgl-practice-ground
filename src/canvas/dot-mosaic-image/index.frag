#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform int uBlockCount; // 分割数

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  float blockCount = float(uBlockCount);
  
  vec2 specimenCoord = floor(texCoord * blockCount) / blockCount + 0.5 / blockCount;
  vec4 finalColor = texture(uTexture0, specimenCoord);
  
  fragColor = finalColor;
}