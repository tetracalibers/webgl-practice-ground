#version 300 es

precision mediump float;

const int lightsCount = 4;

in vec3 vNormal;
in vec3 vLightRay[lightsCount];

// Light
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse[lightsCount];
// Material
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
// frag
uniform bool uLightSource;
uniform bool uWireframe;
// other
uniform float uCutOff;

out vec4 fragColor;

void main() {
  if (uWireframe || uLightSource) {
    fragColor = uMaterialDiffuse;
  } else {
    vec4 Ia = uLightAmbient * uMaterialAmbient;
    vec4 baseColor = vec4(vec3(0.0), 1.0);
    
    vec3 N = normalize(vNormal);
    vec3 L = vec3(0.0);
    float lambertTerm = 0.0;
    
    for (int i = 0; i < lightsCount; i++) {
      L = normalize(vLightRay[i]);
      lambertTerm = dot(N, -L);
      
      if (lambertTerm > uCutOff) {
        baseColor += uLightDiffuse[i] * uMaterialDiffuse * lambertTerm;
      }
    }
    
    baseColor += Ia;
    fragColor = vec4(vec3(baseColor), 1.0);
  }
}