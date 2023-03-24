#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// fnのグラフをxy平面上に描く
float plot(vec2 xy, float fn) {
  // smoothstepはどちらも fn > y の領域を塗りつぶす
  // ちょっとずらして引くことで、線だけを残す
  // 0.01が線の太さを司っている
  return smoothstep(fn - 0.01, fn, xy.y) - smoothstep(fn, fn + 0.01, xy.y);
}

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  float fn = smoothstep(0.1, 0.9, xy.x);
  
  float graph = plot(xy, fn);
  
  // graphに沿って線形補間
  // * mix(背景色, グラフの色, ...)
  // * 背景色はfnによるイージング
  vec3 color = mix(vec3(fn), vec3(0.0, 1.0, 1.0), graph);
  
  outColor = vec4(color, 1.0);
}