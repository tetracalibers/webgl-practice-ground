#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aVelocity;
layout (location = 2) in vec4 aVertexColor;

uniform mat4 uMatrix;
uniform float uMove;

out vec4 vVertexColor;

void main(){
  vVertexColor = aVertexColor + vec4(aVelocity, 0.0);
  gl_Position = uMatrix * vec4(aVertexPosition, 1.0);
  gl_PointSize = 1.0 * (1.0 + uMove);
}