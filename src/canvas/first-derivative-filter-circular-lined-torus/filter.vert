#version 300 es

in vec2 aVertexTextureCoords;
in vec3 aVertexPosition;

out vec2 vTextureCoords;

void main() {
  vTextureCoords = aVertexTextureCoords;
  gl_Position = vec4(aVertexPosition, 1.0);
}