#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform int uCellSize; // 均一化するブロックのサイズ
uniform int uMethod; // 0 => 平均値, 1 => 代表点

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  ivec2 iTextureSize = textureSize(uTexture0, 0);
  vec2 textureSize = vec2(float(iTextureSize.x), float(iTextureSize.y));
  
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  float cellSize = float(uCellSize);
  
  float cellX = mod(texCoord.x, cellSize);
  float cellY = mod(texCoord.y, cellSize);
  
  vec4 finalColor = vec4(vec3(0.0), 1.0);
  
  if (uMethod == 0) {
    for(float x = 0.0; x < cellSize; x += 1.0){
      for(float y = 0.0; y < cellSize; y += 1.0){
        vec2 targetCoord = texCoord + vec2(x - cellX, y - cellY) / textureSize;
        finalColor += texture(uTexture0, targetCoord);
      }
    }
    finalColor /= float(cellSize * cellSize);
  } else if (uMethod == 1) {
    vec2 presCoord = vec2(cellX, cellY) * float(uCellSize) / textureSize;
    finalColor = texture(uTexture0, presCoord);
  }
  
  fragColor = finalColor;
}