#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

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

// 和集合
float mixUnion(float shape1, float shape2) {
  // 少なくとも片方のshape上の点であれば塗りつぶす
  return min(shape1, shape2);
}

// 十字マーク
float crossSymbol(vec2 xy, vec2 center, float size) {
  float horizontal = rect(xy, center, size * 0.25, size);
  float vertical = rect(xy, center, size, size * 0.25);
  return mixUnion(horizontal, vertical);
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  
  vec2 translate = vec2(cos(uTime), sin(uTime));
  float orbitRadius = 0.8;
  pos += translate * orbitRadius;
    
  float shape = crossSymbol(pos, vec2(0.0), 0.25);
  vec3 color = vec3(pos.xy, 0.0);
  
  outColor.rgb = vec3(color + smoothedge(shape));
  outColor.a = 1.0;
}
