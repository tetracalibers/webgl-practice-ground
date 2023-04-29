#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

// Matrix
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
// Light
uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
// Material
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;
// flag
uniform bool uUseVertexColor;
uniform bool uUseLambert;
// other
uniform float uAlpha;

out vec4 vFinalColor;

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  
  float lambertTerm = 1.0;
  
  if (uUseLambert) {
    vec3 N = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vec3 L = normalize(-uLightPosition);
    lambertTerm = max(dot(N, -L), 0.2);
  }
  
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = vec4(0.0);
  
  if (uUseVertexColor) {
    Id = uLightDiffuse * aVertexColor * lambertTerm;
  } else {
    Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
  }
  
  vFinalColor = vec4(vec3(Ia + Id), uAlpha);
  gl_Position = uProjectionMatrix * vertex;
}