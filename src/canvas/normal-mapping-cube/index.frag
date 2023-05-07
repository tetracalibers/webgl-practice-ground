#version 300 es

precision highp float;

in vec2 vTextureCoords;
in vec3 vTangentLightDirection;
in vec3 vTangentEyeDirection;

uniform sampler2D uTexture0; // texture
uniform sampler2D uTexture1; // normal map
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

out vec4 fragColor;

void main() {
  vec3 N = normalize(2.0 * vec3(texture(uTexture1, vTextureCoords)) - 0.5);
  vec3 L = normalize(vTangentLightDirection);
  
  float lambertTerm = max(dot(N, L), 0.2);
  
  vec3 E = normalize(vTangentEyeDirection);
  vec3 R = reflect(-L, N);
  
  float Is = pow(clamp(dot(R, E), 0.0, 1.0), 8.0);
  
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = uLightDiffuse * uMaterialDiffuse * texture(uTexture0, vTextureCoords) * lambertTerm;
  
  fragColor = Ia + Id + Is;
}