#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aVertexNormal;

uniform mat4 uMatModel;
uniform mat4 uMatView;
uniform mat4 uMatProj;
uniform mat4 uMatNormal;
uniform vec3 uLightDir;
uniform vec4 uAmbient;
uniform vec3 uMaterialColor;

out vec4 vVertexColor;

void main() {
  vec3 N = aVertexNormal;
  
  vec3 invL = normalize(uMatNormal * vec4(uLightDir, 0.0)).xyz;
  float diffuse = clamp(dot(N, invL), 0.1, 1.0);
  
  vVertexColor = vec4(uMaterialColor, 1.0) * vec4(vec3(diffuse), 1.0) + uAmbient;
  gl_Position = uMatProj * uMatView * uMatModel * vec4(aVertexPosition, 1.0);
}