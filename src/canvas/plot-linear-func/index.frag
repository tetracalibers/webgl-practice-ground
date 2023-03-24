#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

float plot(vec2 xy) {
  // smoothstep(a, b, x)
  // * x < a の場合、 0
  // * a <= x <= b の場合、t^2(3 - 2t), t = (x - a)/(b - a)
  // * x > b の場合、 1
  
  // 0.0～1.0までの値を用いてyに線を引く
  // * 線の太さを0.005で制御している
  // * xy.y - xy.xは、[-1.0, 1.0]
  // * => 絶対値を取ることで、[0.0, 1.0]に
  return smoothstep(0.005, 0.0, abs(xy.y - xy.x));
}

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  // smoothstepの性質より、[0, 1]の範囲内
  float graph = plot(xy);
  
  // graphに沿って線形補間
  // * mix(背景色, グラフの色, ...)
  vec3 color = mix(vec3(xy.x), vec3(0.0, 1.0, 1.0), graph);
  
  outColor = vec4(color, 1.0);
}