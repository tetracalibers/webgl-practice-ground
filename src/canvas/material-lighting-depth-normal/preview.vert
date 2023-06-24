#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec2 aTexCoord;

uniform vec3 uOffset;

out vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aVertexPosition + uOffset, 1.0);
}