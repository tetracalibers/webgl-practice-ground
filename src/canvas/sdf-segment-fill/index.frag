#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

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

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (2.0 * uMouse.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  mouse.y *= -1.0;
    
  float sdf = segment(pos, vec2(0.0), mouse);
  
  outColor.rgb = vec3(step(0.005, sdf));
  outColor.a = 1.0;
}
