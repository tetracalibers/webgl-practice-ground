#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

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
// other
uniform bool uWireframe;

out vec4 vFinalColor;

void main() {
  if (uWireframe) {
    vFinalColor = uMaterialDiffuse;
  } else {
    vec3 N = vec3(uNormalMatrix * vec4(aVertexNormal, 0.0));
    vec3 L = normalize(-uLightPosition);
    float lambertTerm = dot(N, -L);
    
    if (lambertTerm == 0.0) {
      lambertTerm = 0.01;
    }
    
    vec4 Ia = uLightAmbient;
    vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
    
    vFinalColor = vec4(vec3(Ia + Id), 1.0);
  }

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
}