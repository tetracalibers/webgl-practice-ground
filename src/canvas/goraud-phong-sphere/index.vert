#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
// Lights
uniform vec3 uLightDirection;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
// Materials
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;
uniform float uShininess;

out vec4 vVertexColor;

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  
  // 法線
  vec3 N = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  
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
    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);
    vec3 R = reflect(L, N);
    float specular = pow(max(dot(R, E), 0.0), uShininess);
    Is = uLightSpecular * uMaterialSpecular * specular;
  }
  
  vVertexColor = vec4(vec3(Ia + Id + Is), 1.0);
  gl_Position = uProjectionMatrix * vertex;
}