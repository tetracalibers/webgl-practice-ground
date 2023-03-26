#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// チェビシェフ距離 max(|t_x - f_x|, |t_y - f_y|)
float cdistance(vec2 from, vec2 to) {
  vec2 diff = abs(to - from);
  return max(diff.x, diff.y);
}

// 円
float circle(vec2 point, vec2 center, float radius) {
  return cdistance(point, center) - radius;
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
  
  // 等高線を描く値の間隔
  float interval = 0.1;
  
  // 等高線の描画
  outColor.rgb = vec3(contour(circle(pos, vec2(0.0), 0.7), interval));
  outColor.a = 1.0;
}
