#version 300 es

layout (location = 0) in vec2 aPosition;
layout (location = 1) in float aAge;
layout (location = 2) in float aLife;

// インスタンスの頂点ごとに変化する値
layout (location = 3) in vec2 aInstanceCoord;
layout (location = 4) in vec2 aInstanceTexCoord;

out vec2 vTexCoord;
out float vAge;
out float vLife;

void main() {
  float scale = 0.75;
  vec2 vertCoord = aPosition + (scale * (1.0 - aAge / aLife) + 0.25) * 0.1 * aInstanceCoord;
  
  vAge = aAge;
  vLife = aLife;
  vTexCoord = aInstanceTexCoord;
  
  gl_Position = vec4(vertCoord, 0.0, 1.0);
}