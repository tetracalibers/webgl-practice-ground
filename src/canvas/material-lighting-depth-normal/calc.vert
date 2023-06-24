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

out vec4 vLightning;
out vec4 vMaterial;
out vec3 vNormal;
out float vDepth;

void main() {
  vec3 N = aVertexNormal;
  
  vec3 invL = normalize(uMatNormal * vec4(uLightDir, 0.0)).xyz;
  float diffuse = clamp(dot(N, invL), 0.1, 1.0);
  
  vec4 position = uMatProj * uMatView * uMatModel * vec4(aVertexPosition, 1.0);
  
  vLightning = vec4(uMaterialColor + uAmbient.rgb * diffuse, 1.0);
  vMaterial = vec4(uMaterialColor, 1.0);
  vNormal = N;
  
  // 深度値を線形に変換
  // @see https://qiita.com/aa_debdeb/items/128ccb6fa245b6f618b3
  float depth = position.z / position.w;
  float near = 0.1;
  float far = 10000.0;
  vDepth = 10.0 * (2.0 * near) / (far + near - depth * (far - near));
  
  gl_Position = position;
}