#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightDirection;
uniform vec4 uAmbientColor;
uniform mat4 uInvModelMatrix;

out vec4 vColor;

void main() {
  // モデルが回転などの座標変換を行なっていても、それと真逆の変換をライトベクトルに適用することで相殺する
  vec3 invLight = normalize(uInvModelMatrix * vec4(uLightDirection, 0.0)).xyz;
  // ライト係数
  float diffuse = clamp(dot(aVertexNormal, invLight), 0.1, 1.0);
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor * vec4(vec3(diffuse), 1.0) + uAmbientColor;
}