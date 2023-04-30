#version 300 es

precision mediump float;

const int lightsCount = 3;

in vec3 vNormal[lightsCount];
in vec3 vLightRay[lightsCount];

// Light
uniform vec4 uLightDiffuse[lightsCount];
uniform vec3 uLightDirection[lightsCount];
// Material
uniform vec4 uMaterialDiffuse;
// frag
uniform bool uLightSource;
uniform bool uWireframe;
// other
uniform float uCutOff;
uniform float uExpFactor;

out vec4 fragColor;

void main() {
  if (uWireframe || uLightSource) {
    fragColor = uMaterialDiffuse;
  } else {
    vec4 baseColor = vec4(vec3(0.0), 1.0);
    
    vec3 N = vec3(0.0);
    vec3 L = vec3(0.0);
    float lambertTerm = 0.0;
    
    for (int i = 0; i < lightsCount; i++) {
      L = normalize(vLightRay[i]);
      N = normalize(vNormal[i]);
      lambertTerm = dot(N, -L);
      
      if (lambertTerm > uCutOff) {
        baseColor += uLightDiffuse[i] * uMaterialDiffuse * pow(lambertTerm, uExpFactor * uCutOff);
      }
    }
    
    fragColor = vec4(vec3(baseColor), 1.0);
  }
}