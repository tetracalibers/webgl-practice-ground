#version 300 es

in vec3 aVertexPosition;
in vec2 aVertexTextureCoords;
in vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 vColor;
out vec2 vTextureCoords;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
  vTextureCoords = aVertexTextureCoords;
}