#version 300 es

precision highp float;

vec4 mosaicByAverage(sampler2D tex, vec2 texSize, vec2 center, int mosaicScale) {
  vec4 sumColor = vec4(0.0);
  
  for (int i = 0; i < mosaicScale; i++) {
    for (int j = 0; j < mosaicScale; j++) {
      vec2 offset = vec2(float(i), float(j)) / texSize;
      vec2 coord = center + offset;
      vec4 color = texture(tex, coord);
      sumColor += color.a < 0.1 ? vec4(0.0) : color;
    }
  }
  
  vec4 averageColor = sumColor / float(mosaicScale * mosaicScale);
  
  return averageColor;
}

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
  
  vec4 finalColor = mosaicByAverage(uTexture0, texSize, center, uMosaicScale);
  
  fragColor = finalColor;
}