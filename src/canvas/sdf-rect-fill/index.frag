#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(max(point - dist, vec2(0.0))) + min(max(point.x - dist.x, point.y - dist.y), 0.0);
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
    
  float sdf = rect(pos, vec2(0.0), vec2(0.5));
  
  outColor.rgb = vec3(step(0.0, sdf));
  outColor.a = 1.0;
}
