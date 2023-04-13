#version 300 es

in vec2 aVertexPosition;
in vec2 aVertexTextureCoords;

out vec2 vTextureCoords;

void main() {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  vTextureCoords = aVertexTextureCoords;
}