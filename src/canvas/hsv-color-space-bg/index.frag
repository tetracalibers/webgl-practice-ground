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

// fork from https://www.shadertoy.com/view/MsS3Wc
vec3 hsv2rgb(vec3 color) {
  // Hueを[0, 1]から[0, 6]へスケール
  float hue = color.x * 6.0;
  
  vec3 m = mod(hue + vec3(0.0, 4.0, 2.0), 6.0);
  vec3 a = abs(m - 3.0);
  vec3 rgb = clamp(a - 1.0, 0.0, 1.0);
    
  // 白とrgbを彩度（動径）に沿って補間したものに明度をかける
  return color.z * mix(vec3(1.0), rgb, color.y);
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
  
  pos.x = mod(0.5 * pos.x / PI, 1.0);
  
  outColor.rgb = hsv2rgb(vec3(pos, 1.0));
  outColor.a = 1.0;
}