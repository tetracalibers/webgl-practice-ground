#version 300 es

precision highp float;

in vec4 vColor;
in vec3 vNormal;
in vec3 vPosition;

uniform mat4 uInvModelMatrix;
uniform vec3 uLightPosition;
uniform vec3 uEyeDirection;
uniform vec4 uAmbientColor;

out vec4 fragColor;

// フォンシェーディングはピクセルごとの色の補間処理が必要になるため、
// ライティングの計算を、全てフラグメントシェーダに任せる
void main() {
  // 頂点の位置と点光源の位置を使ってライトベクトルをその都度算出しなければならない
  vec3 lightDirection = uLightPosition - vPosition;
  
  // モデルが回転などの座標変換を行なっていても、それと真逆の変換をライトベクトルに適用することで相殺する
  vec3 invLight = normalize(uInvModelMatrix * vec4(lightDirection, 0.0)).xyz;
  vec3 invEye = normalize(uInvModelMatrix * vec4(uEyeDirection, 0.0)).xyz;
  
  // ライトベクトルと視線ベクトルとのハーフベクトル
  vec3 halfLE = normalize(invLight + invEye);
  
  // ライト係数
  float diffuse = clamp(dot(vNormal, invLight), 0.0, 1.0) + 0.2;
  
  // 面法線ベクトルとの内積を取ることで反射光を計算
  // 反射光は強いハイライトを演出するためのものなので、
  // 内積によって得られた結果をべき乗によって収束させることで、
  // 弱い光をさらに弱く、強い光はそのまま残すという具合に変換させる
  float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);
  
  // 反射光は光の強さを直接表す係数として使うので、環境光と同じように加算処理で色成分に加える
  vec4 light = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + uAmbientColor;
  
  // 色 = 頂点色 * 拡散光 + 反射光 + 環境光
  fragColor = light;
}