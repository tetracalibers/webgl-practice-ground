#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// ジャギーを防止しつつ、輪郭をはっきりさせる
float smoothedge(float shape) {
  return smoothstep(0.0, 1.0 / uResolution.x, shape);
}

// 矩形
float rect(vec2 xy, vec2 center, float width, float height) {
  // centerからxyまでの距離
  vec2 p = abs(xy - center);
  // centerから右上の頂点までの距離
  vec2 v = vec2(width, height) * 0.5;
  
  // centerから辺への距離の最大値がv（中心から角が一番長い）
  // xyが矩形内部の点であれば、centerからxyの距離pの方がvより短いはず
  // つまり、p.x < v.x && p.y < v.y
  // すなわち、d.x < 0.0 && d.y < 0.0 なら、xyは矩形内部の点
  vec2 d = p - v;

  // d.x < 0.0 && d.y < 0.0なら、黒0.0を返す
  // d.x > 0.0 || d.y > 0.0 の場合にdの長さを取れば、それは正の数になる
  // => 矩形の辺の外の遠くにあるほど、白くなる
  return length(max(d, 0.0));
}

// 角が丸い矩形
float roundRect(vec2 xy, vec2 center, float width, float height, float radius) {
  // centerからxyまでの距離
  vec2 p = abs(xy - center);
  // centerから右上の頂点までの距離
  // 角丸半径分サイズが大きくならないように調整
  vec2 v = vec2(width, height) * 0.5 - radius;
  
  // centerから辺への距離の最大値がv（中心から角が一番長い）
  // xyが矩形内部の点であれば、centerからxyの距離pの方がvより短いはず
  // つまり、p.x < v.x && p.y < v.y
  // すなわち、d.x < 0.0 && d.y < 0.0 なら、xyは矩形内部の点
  vec2 d = p - v;

  // d.x < 0.0 && d.y < 0.0なら、黒0.0を返す
  // d.x > 0.0 || d.y > 0.0 の場合にdの長さを取れば、それは正の数になる
  // => 矩形の辺の外の遠くにあるほど、白くなる
  return length(max(d, 0.0)) - radius;
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  pos *= 2.0;
  pos -= 1.0;
  
  float shape1 = roundRect(pos, vec2(0.0, 0.5), 0.5, 0.5, 0.05);
  float shape2 = rect(pos, vec2(0.0, -0.5), 0.5, 0.5);
  
  outColor.rgb = vec3(smoothedge(min(shape1, shape2)));
  outColor.a = 1.0;
}
