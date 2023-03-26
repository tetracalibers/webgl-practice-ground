#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の3d => 3dハッシュ関数
uvec3 uhash33(uvec3 n){
  n ^= (n.yzx << u);
  n ^= (n.yzx >> u);
  n *= k;
  n ^= (n.yzx << u);
  return n * k;
}

// 浮動小数点数の3d => 1dハッシュ関数
float hash31(vec3 b) {
  // ビット列を符号なし整数に変換
  uvec3 n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash33(n).x) / float(UINT_MAX);
}

float vnoise31(vec3 pos) {
  // タイルの原点
  vec3 origin = floor(pos);
  
  // タイルの各頂点のハッシュ値
  float corner000 = hash31(origin);
  float corner010 = hash31(origin + vec3(0.0, 1.0, 0.0));
  float corner011 = hash31(origin + vec3(0.0, 1.0, 1.0));
  float corner001 = hash31(origin + vec3(0.0, 0.0, 1.0));
  float corner100 = hash31(origin + vec3(1.0, 0.0, 0.0));
  float corner110 = hash31(origin + vec3(1.0, 1.0, 0.0));
  float corner111 = hash31(origin + vec3(1.0, 1.0, 1.0));
  float corner101 = hash31(origin + vec3(1.0, 0.0, 1.0));
  
  // タイル内のどの辺にいるか（小数部分）によってエルミート補間
  vec3 f = smoothstep(0.0, 1.0, fract(pos));
  
  // 底面(x, y, 0)の補間
  float bottom = mix(
    mix(corner000, corner100, f.x), // (x, 0, 0)
    mix(corner010, corner110, f.x), // (x, 1, 0)
    f.y
  );
  // 上面(x, y, 1)の補間
  float top = mix(
    mix(corner001, corner101, f.x), // (x, 0, 1)
    mix(corner011, corner111, f.x), // (x, 1, 1)
    f.y
  );
  
  // z軸に沿って補間
  return mix(bottom, top, f.z);
}

void main() {
  // x, yを同じ値で割ることで、画面の縦横比に応じて歪むことがなくなる
  vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
  
  // [0, 10]区間にスケール
  pos *= 10.0;
  // 移動
  pos += uTime;
  
  outColor.rgb = vec3(vnoise31(vec3(pos, uTime)));
  outColor.a = 1.0;
}