#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec3 vNormal;
out vec3 vEyeVector;

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  
  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  vEyeVector = -vec3(vertex.xyz);

  gl_Position = uProjectionMatrix * vertex;
}