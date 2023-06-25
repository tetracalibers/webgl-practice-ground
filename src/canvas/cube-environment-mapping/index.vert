#version 300 es

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aVertexNormal;

uniform mat4 uMatModel;
uniform mat4 uMatView;
uniform mat4 uMatProj;

out vec3 vPosition;
out vec3 vNormal;
out vec4 vColor;

void main() {
  vPosition = (uMatModel * vec4(aVertexPosition, 1.0)).xyz;
  vNormal = (uMatModel * vec4(aVertexNormal, 0.0)).xyz;
  vColor = vec4(1.0);
  
  gl_Position = uMatProj * uMatView * uMatModel * vec4(aVertexPosition, 1.0);
}