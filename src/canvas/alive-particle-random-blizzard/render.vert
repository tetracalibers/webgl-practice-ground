#version 300 es

layout (location = 0) in vec2 aPosition;
layout (location = 1) in float aAge;
layout (location = 2) in float aLife;

out float vAge;
out float vLife;

void main() {
  vAge = aAge;
  vLife = aLife;

  // 古いほど小さくする
  gl_PointSize = 1.0 + 3.0 * (1.0 - aAge / aLife);
  
  gl_Position = vec4(aPosition, 0.0, 1.0);
}