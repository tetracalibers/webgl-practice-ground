#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec2 aPoint;

out vec3 vColor;

void main() {
  vec2 offset = aPoint * 2.0 - 1.0;
  vColor = vec3(aPoint, 1.0);
  gl_Position = vec4(aVertexPosition.xy + offset, aVertexPosition.z, 1.0);
}