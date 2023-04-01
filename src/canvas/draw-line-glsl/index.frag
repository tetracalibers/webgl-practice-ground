#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

// 2点from, toを端点にもつ線分との距離を返す
float segment(vec2 xy, vec2 from, vec2 to) {
  // xyのfromからの距離
  vec2 v1 = xy - from;
  // toのfromからの距離
  vec2 v2 = to - from;
  
  // ベクトルv1をv2方向に正射影(orthographic projection)したベクトルの係数部分
  // * v2方向 = 線分上
  float orthlen = dot(v1, v2) / dot(v2, v2);
  orthlen = clamp(orthlen, 0.0, 1.0);
  // ベクトルv1をv2方向に正射影(orthographic projection)したベクトル
  vec2 orth = orthlen * v2;
  
  return length(v1 - orth);
}

// p1とp2を結ぶ線分
float line(vec2 xy, vec2 p1, vec2 p2, float thickness, float antispread) {
  // 線分をなぞるベクトル
  vec2 seg = p1 - p2;
  
  // segに垂直なベクトル
  // * 垂直なベクトル同士の内積は0
  // * (x, y) * (y , -x) = xy + -xy = 0
  vec2 per = vec2(seg.y, -seg.x);
  
  // ベクトルv2のv1方向の符号つき長さは、v1が単位ベクトルなら、
  // dot(v2, v1) / dot(v1, v1) = dot(v2, v1) = dot(v1, v2)
  // つまりこれは、p1 - xyの、normalize(per)方向の成分の値
  // すなわち、xyと線分の距離
  float dist = dot(normalize(per), p1 - xy);
  
  // thicknessが半分になれば、thickは2倍になる
  float thick = 1.0 / thickness;
  
  // thicknessが小さいほど、tdは大きな値になる
  // 線上から遠い点ほど、tdは大きな値になる
  // xyが線に近く、太い線を描くときほど、tdは最小に近づく
  // xyが線から遠く、細い線を描くときほど、tdは最大に近づく
  // つまり、これは線の太さを考慮した、線上の点と点xyの遠さを表す
  // 線の太さを考慮 = 太さのある線の場合、線の輪郭に近くなるほど色を薄くする
  float td = abs(dist * thick);
  
  // tdが半分になれば、lは2倍になる
  // 線分の芯に近い点ほど濃い色になる
  float l = 1.0 / td;
  
  return dot(xy - p2, p1 - p2) > 0.0 && dot(xy - p1, p2 - p1) > 0.0 
    ? pow(l, antispread) // 線分上の点（antispreadが大きいほど、境界が滑らかに）
    : 0.0; // 直線上ではあるが、線分上ではない場合
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (2.0 * uMouse.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  mouse.y *= -1.0;
    
  float sdf = segment(pos, vec2(0.0), mouse);
  
  outColor.rgb = vec3(line(pos, vec2(0.0), vec2(0.5), 0.005, 3.0));
  outColor.a = 1.0;
}
