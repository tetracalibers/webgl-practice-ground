#version 300 es

const int lightsCount = 4;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

// Matrix
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
// Light
uniform vec3 uLightPosition[lightsCount];
// Material
uniform vec4 uMaterialDiffuse;
// other
uniform bool uWireframe;

out vec3 vNormal;
out vec3 vLightRay[lightsCount];

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  
  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  
  for (int i = 0; i < lightsCount; i++) {
    vec4 lightPosition = uModelViewMatrix * vec4(uLightPosition[i], 1.0);
    vLightRay[i] = vertex.xyz - lightPosition.xyz;
  }
  
  gl_Position = uProjectionMatrix * vertex;
}