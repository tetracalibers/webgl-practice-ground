#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  vec3 RED = vec3(1.0, 0.0, 0.0);
  vec3 GREEN = vec3(0.0, 1.0, 0.0);
  vec3 BLUE = vec3(0.0, 0.0, 1.0);
  // 色配列
  vec3[3] colors3 = vec3[](RED, BLUE, GREEN);
  // x座標範囲を[0, 2]区間にスケール
  pos.x *= 2.0;
  // 整数型に変換することで、0, 1, 2のいずれかの値になる
  int idx = int(pos.x);
  // 配列から連続する2つのベクトルを取り出し、線形補間
  // - fractは小数部分を取得する関数
  vec3 xlerpColor = mix(colors3[idx], colors3[idx + 1], fract(pos.x));
  
  outColor = vec4(xlerpColor, 1.0);
}