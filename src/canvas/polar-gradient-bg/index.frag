#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// atan を x = 0 上でも定義した拡張版
// tan(y) = x となるy（偏角）を(-PI, PI]の範囲で返す
float atan2(float y, float x) {
  // x = 0 の場合、点 (x, y) はy軸上
  // => つまり、偏角は 90° か -90° で、yの符号によって決まる
  return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

// 直交座標 (x, y) -> 極座標 (偏角s, 動径t)
vec2 xy2pol(vec2 xy) {
  return vec2(atan2(xy.y, xy.x), length(xy));
}

// 極座標 (偏角s, 動径t) -> 直交座標 (x, y)
vec2 pol2xy(vec2 pol) {
  // 単位円（半径 = 1）の場合、(x, y) = (cos, sin)
  return pol.t * vec2(cos(pol.s), sin(pol.s));
}

// グラデーションを極座標に対してマッピング
vec3 tex(vec2 pol) {
  vec3[3] colors3 = vec3[](
    vec3(0.0, 0.0, 1.0), // 青
    vec3(1.0, 0.0, 0.0), // 赤
    vec3(1.0) // 白
  );
  
  // 配列のインデックスに対応させるため、偏角の範囲を[0, 2)区間に対応
  // * 偏角は(-PI, PI]の範囲なので、PIで割ると(-1.0, 1.0]
  // * 1.0を足すことで、(0.0, 2.0]になる
  pol.s = pol.s / PI + 1.0;
  
  // 整数型に変換することで、0, 1, 2のいずれかの値になる
  int idx = int(pol.s);
  
  // 偏角に沿って赤、青、赤を線形補間
  // * idx = 0 なら、mix(colors3[0], colors3[1], ...)
  // * idx = 1 なら、mix(colors3[1], colors3[0], ...)
  // * idx = 2 なら、mix(colors3[0], colors3[1], ...)
  vec3 lerpedRB = mix(colors3[idx % 2], colors3[(idx + 1) % 2], fract(pol.s));
  
  // 動径に沿ってlerpRBと白を線形補間
  return mix(colors3[2], lerpedRB, pol.t);
}

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  // フラグメント座標範囲を[-1, 1]区間に変換
  // * 元々、フラグメント座標は第一象限内[0, 1]
  // * 2倍することで、[0, 2]に
  // * 1を引くことで、[-1, 1]に
  pos = 2.0 * pos.xy - vec2(1.0);
  
  // 極座標に変換
  pos = xy2pol(pos);
  
  // テクスチャマッピング
  outColor = vec4(tex(pos), 1.0);
}