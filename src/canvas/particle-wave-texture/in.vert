#version 300 es

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec4 aVertexColor;

uniform mat4 uMatrix;

out vec4 vVertexColor;

void main(){
  vVertexColor = aVertexColor;
  gl_Position = uMatrix * aVertexPosition;
  gl_PointSize = 1.0;
}