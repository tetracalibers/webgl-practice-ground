#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

// 円周率
const float PI = 3.1415926;

// 2次元平面上の回転
vec2 rot2(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// x軸を中心とした回転
vec3 rotX(vec3 p, float angle) {
  return vec3(p.x, rot2(p.yz, angle));
}

// 市松模様
float checkerd(vec2 p) {
  return mod(floor(p.x) + floor(p.y), 2.0);
}

void main() {
  // ビューポートの中心を原点として [0, 1] -> [-1, 1] にスケール
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  
  // マウスのy座標を回転角に対応させる
  float angle = uMouse.y / uResolution.y * -0.5 * PI;
  
  // カメラ
  vec3 cameraPos = vec3(0.0, 0.0, 0.0); // カメラの位置
  vec3 cameraDir = vec3(0.0, 0.0, -1.0); // 撮影する方向
  vec3 cameraUp = vec3(0.0, 1.0, 0.0); // カメラの上方向
  
  // x軸を中心に回転
  cameraDir = rotX(cameraDir, angle);
  cameraUp = rotX(cameraUp, angle);
  
  // スクリーンの横方向
  vec3 cameraRight = cross(cameraDir, cameraUp);
  
  // スクリーンまでの距離
  float targetDepth = 1.0;
  
  // カメラからスクリーンに向かうベクトル
  // カメラの各方向はそのまま、vec3(p, targetDepth)に向かって引き伸ばす
  vec3 ray = cameraRight * p.x + cameraUp * p.y + cameraDir * targetDepth;
  // カメラの位置を原点にする
  ray -= cameraPos;
  // レイを正規化
  ray = normalize(ray);
  
  // 地面の法線
  vec3 groundNormal = vec3(0.0, 1.0, 0.0);
  
  // レイと地面の法線のなす角
  float rayGroundAngle = dot(ray, groundNormal);
  
  // 交差しない場合のデフォルト色
  vec3 outColor = vec3(0.0);
  
  // 交差するならテクスチャマッピング
  if (rayGroundAngle < 0.0) {
    // マウスのx座標をカメラと地面の距離に対応させる
    float groundHeight = uMouse.x / uResolution.x + 1.0;
    // レイと地面の交点
    vec3 hit = cameraPos - ray * groundHeight / rayGroundAngle;
    // 交点のzx座標をテクスチャ座標に対応させる
    float texture = checkerd(hit.zx);
    outColor = vec3(texture);
  }
  
  fragColor = vec4(outColor, 1.0);
}