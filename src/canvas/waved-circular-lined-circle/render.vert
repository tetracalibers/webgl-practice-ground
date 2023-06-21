#version 300 es

layout (location = 0) in vec2 aVertexPosition;
layout (location = 2) in vec2 aInstanceOffset;

out float vTheta;

uniform float uAspect;
uniform float uTime;
uniform vec2 uResolution;

// 円周率
const float PI = 3.1415926;

void main() {
  
  float theta = float(gl_InstanceID) * PI * 2.0;
  float instanceRadius = 0.9 * sin(theta * 0.9 + uTime) + 0.9;
  
  float radius = 0.2 * sin(theta) + 0.7;
  
  vTheta = theta;
  gl_Position = vec4((aVertexPosition * instanceRadius + aInstanceOffset) * radius, 0.0, 1.0);
}