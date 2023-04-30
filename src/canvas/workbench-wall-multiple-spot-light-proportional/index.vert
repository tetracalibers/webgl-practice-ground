#version 300 es

const int lightsCount = 3;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

// Matrix
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
// Light
uniform vec3 uLightPosition[lightsCount];
uniform vec3 uLightDirection[lightsCount];

out vec3 vNormal[lightsCount];
out vec3 vLightRay[lightsCount];

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vec3 normal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  
  for (int i = 0; i < lightsCount; i++) {
    vec4 positionLight = uModelViewMatrix * vec4(uLightPosition[i], 1.0);
    vec3 directionLight = vec3(uNormalMatrix * vec4(uLightDirection[i], 1.0));
    vNormal[i] = normal - directionLight;
    vLightRay[i] = vertex.xyz - positionLight.xyz;
  }
  
  gl_Position = uProjectionMatrix * vertex;
}