#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aVelocity;
layout (location = 2) in vec4 aVertexColor;

uniform float uTime;
uniform vec2 uMouse; // -1.0 ~ 1.0
uniform float uMove; // 0.0 ~ 1.0

out vec3 vVertexPosition;
out vec3 vVelocity;
out vec4 vVertexColor;

void main(){
  vVertexPosition = aVertexPosition + aVelocity * 0.1 * uMove;
  
  vec3 p = vec3(uMouse, sin(uTime) * 0.25) - aVertexPosition;
  vVelocity = normalize(aVelocity + p * 0.2 * uMove);
  
  vVertexColor = aVertexColor;
}