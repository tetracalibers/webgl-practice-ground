#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// 2点from, toを端点にもつ線分との距離を返す
float segment(vec2 xy, vec2 from, vec2 to) {
  // xyのfromからの距離
  vec2 v1 = xy - from;
  // toのfromからの距離
  vec2 v2 = to - from;
  
  // ベクトルv1をv2方向に正射影(orthographic projection)したベクトルの係数部分
  // * v2方向 = 線分上
  float orthlen = dot(v1, v2) / dot(v2, v2);
  orthlen = clamp(orthlen, 0.0, 1.0);
  // ベクトルv1をv2方向に正射影(orthographic projection)したベクトル
  vec2 orth = orthlen * v2;
  
  return length(v1 - orth);
}

// 等高線
vec3 contour(float v, float interval) {
  return abs(v) < 0.01
    ? vec3(0.0) // 等高線を黒で描画
    : mod(v, interval) < 0.01
      ? vec3(1.0) // 等間隔の値の等高線を白で描画
      : mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), atan(v) / PI + 0.5); // 等高線以外は中間色で描画
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (2.0 * uMouse.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  mouse.y *= -1.0;
  
  // 等高線を描く値の間隔
  float interval = 0.1;
  
  float sdf = segment(pos, vec2(0.0), mouse);
  
  // 等高線の描画
  outColor.rgb = vec3(contour(sdf, interval));
  outColor.a = 1.0;
}
