#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform int uMosaicScale;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 iTextureSize = textureSize(uTexture0, 0);
  vec2 texSize = vec2(float(iTextureSize.x), float(iTextureSize.y));
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  float mosaicScale = float(uMosaicScale);
  vec2 center = floor(texCoord * texSize / mosaicScale) / (texSize / mosaicScale) + (mosaicScale * 0.5) / texSize;
  
  vec4 finalColor = texture(uTexture0, center);
  
  fragColor = finalColor;
}