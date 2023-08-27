#version 300 es

layout (location = 0) in vec2 aVertexPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec2 aInstanceOffset;

out vec2 vTexCoord;
out float vTheta;

uniform float uTime;

// 円周率
const float PI = 3.1415926;

void main() {
  vTexCoord = aTexCoord;
  
  float theta = float(gl_InstanceID) * PI * 2.0;
  float base = 1.0;
  float instanceRadius = base * sin(theta * 0.9 + uTime) + base;
  
  vTheta = theta;
  gl_Position = vec4(aVertexPosition * instanceRadius + aInstanceOffset * 0.7, 0.0, 1.0);
}