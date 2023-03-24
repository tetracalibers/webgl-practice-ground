#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// fnのグラフをxy平面上に描く
float plot(vec2 xy, float fn) {
  // smoothstepはどちらも fn > y の領域を塗りつぶす
  // ちょっとずらして引くことで、線だけを残す
  // 0.01が線の太さを司っている
  return smoothstep(fn - 0.005, fn, xy.y) - smoothstep(fn, fn + 0.005, xy.y);
}

vec3 colorA = vec3(0.149,0.141,0.912);
vec3 colorB = vec3(1.000,0.833,0.224);

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  vec3 fn = vec3(xy.x);
  fn.r = smoothstep(0.0, 1.0, xy.x);
  fn.g = sin(xy.x * PI);
  fn.b = pow(xy.x, 0.5);
  
  vec3 color = mix(colorA, colorB, fn);
  
  // 各fnのグラフに沿って線形補間
  // * mix(背景色, グラフの色, ...)
  color = mix(color, vec3(1.0, 0.0, 0.0), plot(xy, fn.r));
  color = mix(color, vec3(0.0, 1.0, 0.0), plot(xy, fn.g));
  color = mix(color, vec3(0.0, 0.0, 1.0), plot(xy, fn.b));
  
  outColor = vec4(color, 1.0);
}
