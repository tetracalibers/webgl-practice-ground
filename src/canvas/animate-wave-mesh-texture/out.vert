#version 300 es

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec4 aVertexColor;

uniform float uTime;
uniform vec2 uMouse;

out vec4 vVertexColor;

void main(){
  vec2 p = uMouse - aVertexPosition.xy;
  float z = cos(length(p * 20.0) - uTime) * 0.1;
  
  gl_Position = aVertexPosition + vec4(0.0, 0.0, z, 0.0);
  vVertexColor = aVertexColor;
}