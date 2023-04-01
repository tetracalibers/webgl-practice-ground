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
  
  // 半径
  float radius = 0.1;
  
  // 色を反転させる
  // * orbがradiusより大きい値 -> 小さい値に
  // * orbがradiusより小さい値 -> 大きい値に
  // * orb = radius -> 真っ白（1.0）になるので、境界がはっきり描かれる
  orb = radius / orb;
  
  outColor.rgb = vec3(orb);
  outColor.a = 1.0;
}
