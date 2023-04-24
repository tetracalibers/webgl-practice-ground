#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vEyeVector;

uniform float uShininess;
// Lights
uniform vec3 uLightDirection;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
// Materials
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;

out vec4 fragColor;

void main() {
  // 法線
  vec3 N = vec3(vNormal);
  
  // 光線の向き
  vec3 L = normalize(uLightDirection);
  
  // ランバート係数
  float lambertTerm = dot(N, -L);
  
  // Ambient
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  // Diffuse
  vec4 Id = vec4(0.0, 0.0, 0.0, 1.0);
  // Specular
  vec4 Is = vec4(0.0, 0.0, 0.0, 1.0);

  if (lambertTerm > 0.0) {
    Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
    vec3 E = normalize(vEyeVector);
    vec3 R = reflect(L, N);
    float specular = pow(max(dot(R, E), 0.0), uShininess);
    Is = uLightSpecular * uMaterialSpecular * specular;
  }
  
  fragColor = vec4(vec3(Ia + Id + Is), 1.0);
}