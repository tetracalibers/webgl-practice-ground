#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 vColor;
out vec3 vNormal;
out vec3 vPosition; // モデル座標変換を行なったあとの頂点の位置

void main() {
  // 点光源から発された光のライトベクトルは、
  // モデル座標変換を行なったあとの頂点の位置を考慮したものでなければならない
  vPosition = (uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
  vNormal = aVertexNormal;
  vColor = aVertexColor;
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
}