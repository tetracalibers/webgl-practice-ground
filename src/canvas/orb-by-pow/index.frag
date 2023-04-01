#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (2.0 * uMouse.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  mouse.y *= -1.0;
  
  // 中心に近くなるにつれて小さい値に -> 黒くなる
  float orb = length(mouse - pos);
  // 中心に近くなるにつれて大きい値に -> 白くなる
  // 1.0 - orb だと、中心点だけが真っ白（1.0）になる
  // 真っ白範囲を広げるため、もっと大きな値から引く
  orb = 1.1 - orb;
  // 溢れている光の量が多すぎて、中心にあるオーブがあまりくっきり見えない
  // そこで、累乗で外に行くにつれて一気に値が増加するようにする
  // 冪は奇数でなければならない。
  // 偶数だと、グラフが左右対称になる（同じ値になる瞬間が存在する）ため、2重の円になってしまう
  orb = pow(orb, 5.0);
  
  outColor.rgb = vec3(orb);
  outColor.a = 1.0;
}
