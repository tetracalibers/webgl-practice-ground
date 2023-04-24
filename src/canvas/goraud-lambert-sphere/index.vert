#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection; // 光源からの入射方向
uniform vec4 uLightDiffuse; // 光の拡散反射色
uniform vec4 uMaterialDiffuse; // マテリアルの拡散反射色

out vec4 vVertexColor;

void main() {
  // 法線
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
  
  // 変換行列で光線の向きも変換
  vec3 light = vec3(uModelViewMatrix * vec4(uLightDirection, 0.0));
  
  // 光線の向き
  vec3 L = normalize(light);
  
  // ランバート係数
  float lambertTerm = dot(N, -L);
  
  // ランバート反射モデルに基づいた拡散反射色
  vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  
  vVertexColor = vec4(vec3(Id), 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
}