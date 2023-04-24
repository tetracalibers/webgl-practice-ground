#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightDirection;
uniform vec3 uEyeDirection;
uniform vec4 uAmbientColor;
uniform mat4 uInvModelMatrix;

out vec4 vColor;

void main() {
  // モデルが回転などの座標変換を行なっていても、それと真逆の変換をライトベクトルに適用することで相殺する
  vec3 invLight = normalize(uInvModelMatrix * vec4(uLightDirection, 0.0)).xyz;
  vec3 invEye = normalize(uInvModelMatrix * vec4(uEyeDirection, 0.0)).xyz;
  
  // ライトベクトルと視線ベクトルとのハーフベクトル
  vec3 halfLE = normalize(invLight + invEye);
  
  // ライト係数
  float diffuse = clamp(dot(aVertexNormal, invLight), 0.1, 1.0);
  
  // 面法線ベクトルとの内積を取ることで反射光を計算
  // 反射光は強いハイライトを演出するためのものなので、
  // 内積によって得られた結果をべき乗によって収束させることで、
  // 弱い光をさらに弱く、強い光はそのまま残すという具合に変換させる
  float specular = pow(clamp(dot(aVertexNormal, halfLE), 0.0, 1.0), 50.0);
  
  // 反射光は光の強さを直接表す係数として使うので、環境光と同じように加算処理で色成分に加える
  vec4 light = uAmbientColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor * light;
}