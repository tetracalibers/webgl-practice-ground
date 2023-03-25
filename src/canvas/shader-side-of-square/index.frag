#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  // float left = step(0.1, xy.x); // x < 0.1 なら黒 = 0.0
  // float bottom = step(0.1, xy.y); // y < 0.1 なら黒 = 0.0
  // ↑を合わせて書いた
  vec2 bottom_left = step(vec2(0.1), xy);
  
  // xy座標を反転（紙をひっくり返すように）
  // 原点が左下[0, 0]から右上[1, 1]になる
  xy = 1.0 - xy;
  
  // ひっくり返した上で同様に辺を描く
  vec2 top_right = step(vec2(0.1), xy);
  
  // 掛け算 = AND演算
  // * 両方の値が 1.0 だった場合にのみ 1.0
  // * つまり、左辺でも底辺でもない箇所のみ白で塗りつぶす（それ以外は黒）
  float color = bottom_left.x * bottom_left.y;
  // 同様に
  color *= top_right.x * top_right.y;
  
  outColor = vec4(vec3(color), 1.0);
}
