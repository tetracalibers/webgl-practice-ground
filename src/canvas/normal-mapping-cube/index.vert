#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aVertexTextureCoords;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightPosition;

out vec2 vTextureCoords;
out vec3 vTangentLightDirection;
out vec3 vTangentEyeDirection;

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  
  vec3 normal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  vec3 tangent = cross(normal, vec3(0.0, 1.0, 0.0));
  vec3 bitangent = cross(normal, tangent);
  
  mat3 toTangentSpace = mat3(
    tangent.x, bitangent.x, normal.x,
    tangent.y, bitangent.y, normal.y,
    tangent.z, bitangent.z, normal.z
  );
  
  vec3 eyeDirection = -vertex.xyz;
  vec3 lightDirection = uLightPosition - vertex.xyz;
  
  vTangentEyeDirection = eyeDirection * toTangentSpace;
  vTangentLightDirection = lightDirection * toTangentSpace;
  vTextureCoords = aVertexTextureCoords;
  gl_Position = uProjectionMatrix * vertex;
}