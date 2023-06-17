#version 300 es

/**

この頂点シェーダを呼び出すたびに、対応するパーティクルを1つだけ更新する

- in : システム内のパーティクルの現在の状態
- out: 指定された時間が経過した後のパーティクルの更新された状態を含むバッファを生成

**/

// 粒子がどこにあるか
layout (location = 0) in vec2 aPosition;
// 粒子がどこに向かうのか、どのくらいの速さで向かうのか
layout (location = 1) in vec2 aVelocity;
// 粒子の年齢（秒）
layout (location = 2) in float aAge;
// 粒子の寿命（秒）
layout (location = 3) in float aLife;

out vec2 vPosition;
out vec2 vVelocity;
out float vAge;
out float vLife;

// 合計時間
uniform float uTime;
// 最後の更新ステップから経過した秒数
uniform float uTimeDelta;
// ベクトル(1,0)と新生粒子の速度ベクトルとの間の角度の最小値と最大値
// 全方向のパーティクルを放出するには、Minを-PI、MaxをPIに設定する
uniform float uMinTheta;
uniform float uMaxTheta;
// 生まれたばかりのパーティクルに割り当てられる、速さの最小値と最大値
uniform float uMinSpeed;
uniform float uMaxSpeed;
// すべての粒子に常に影響する重力
uniform vec2 uGravity;
// 新しく生まれたすべての粒子が移動を開始する地点
uniform vec2 uOrigin;

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の2d => 2dハッシュ関数
uvec2 uhash22(uvec2 n){
  n ^= (n.yx << u.xy);
  n ^= (n.yx >> u.xy);
  n *= k.xy;
  n ^= (n.yx << u.xy);
  return n * k.xy;
}

// 浮動小数点数の2d => 2dハッシュ関数
vec2 hash22(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return vec2(uhash22(n)) / vec2(UINT_MAX);
}

// 符号なし整数の3d => 3dハッシュ関数
uvec3 uhash33(uvec3 n){
  n ^= (n.yzx << u);
  n ^= (n.yzx >> u);
  n *= k;
  n ^= (n.yzx << u);
  return n * k;
}

// 格子点latticeを12通りの計算にランダムに対応させる
// ---
// ind = 0 のとき、 p.x + p.y
// ind = 1 のとき、-p.x + p.y
// ind = 2 のとき、 p.x - p.y
// ind = 3 のとき、-p.x - p.y
// ---
// ind = 4 のとき、 p.x + p.z
// ind = 5 のとき、-p.x + p.z
// ind = 6 のとき、 p.x - p.z
// ind = 7 のとき、-p.x - p.z
// ---
// ind = 8 のとき、 p.y + p.z
// ind = 9 のとき、-p.y + p.z
// ind = 10のとき、 p.y - p.z
// ind = 11のとき、-p.y - p.z
// ind = 12のとき、 p.y + p.x
// ---
// ind = 13のとき、-p.y + p.z
// ind = 14のとき、 p.y - p.x
// ind = 15のとき、-p.y - p.z
// ---
float gtable3(vec3 lattice, vec3 p){
  // ビット列に変換
  uvec3 n = floatBitsToUint(lattice);
  // 32桁のハッシュ値をシフトして、10進数の16桁（2進数の4桁）にする
  uint ind = uhash33(n).x >> 28;
  // 8より小さければx, そうでなければy
  float u = ind < 8u ? p.x : p.y;
  // 4より小さければy、4以上で12か14ならx、そうでなければz
  float v = ind < 4u ? p.y : ind == 12u || ind == 14u ? p.x : p.z;
  // 符号を決める
  // (ind & 1, ind & 2) は、(0, 0), (1, 0), (0, 2), (1, 2)の4通りを繰り返す
  // つまり、(+, +), (-, +), (+, -), (-, -)の4通りを繰り返す
  return ((ind & 1u) == 0u? u: -u) + ((ind & 2u) == 0u? v : -v);
}

// 5次エルミート補間
vec3 hermite5(vec3 x) {
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// 1 / sqrt(2) = 0.70710678 ...
// apxはapprox（近似）の略
const float apx_1inSqrt2 = 0.70710678;

// パーリンノイズ（ 3 => 1 ）
float pnoise31(vec3 p) {
  // タイルの頂点
  vec3 p0 = floor(p);
  vec3 p1 = p0 + vec3(1.0, 0.0, 0.0);
  vec3 p2 = p0 + vec3(0.0, 1.0, 0.0);
  vec3 p3 = p0 + vec3(1.0, 1.0, 0.0);
  vec3 p4 = p0 + vec3(0.0, 0.0, 1.0);
  vec3 p5 = p4 + vec3(1.0, 0.0, 0.0);
  vec3 p6 = p4 + vec3(0.0, 1.0, 0.0);
  vec3 p7 = p4 + vec3(1.0, 1.0, 0.0);
  
  // タイル内のどの辺にいるか（小数部分）
  vec3 f = fract(p);
  
  // 各頂点からの距離
  vec3 d0 = f;
  vec3 d1 = f - vec3(1.0, 0.0, 0.0);
  vec3 d2 = f - vec3(0.0, 1.0, 0.0);
  vec3 d3 = f - vec3(1.0, 1.0, 0.0);
  vec3 d4 = f - vec3(0.0, 0.0, 1.0);
  vec3 d5 = f - vec3(1.0, 0.0, 1.0);
  vec3 d6 = f - vec3(0.0, 1.0, 1.0);
  vec3 d7 = f - vec3(1.0, 1.0, 1.0);
  
  // 各頂点からの距離とハッシュ値の内積
  // sqrt(2)で割ることで正規化
  float dh0 = gtable3(p0, d0) * apx_1inSqrt2;
  float dh1 = gtable3(p1, d1) * apx_1inSqrt2;
  float dh2 = gtable3(p2, d2) * apx_1inSqrt2;
  float dh3 = gtable3(p3, d3) * apx_1inSqrt2;
  float dh4 = gtable3(p4, d4) * apx_1inSqrt2;
  float dh5 = gtable3(p5, d5) * apx_1inSqrt2;
  float dh6 = gtable3(p6, d6) * apx_1inSqrt2;
  float dh7 = gtable3(p7, d7) * apx_1inSqrt2;
  
  // タイル内のどの辺にいるか（小数部分）によってエルミート補間
  vec3 w = hermite5(f);
  
  // z = 0 の面
  // (x, 0, 0)をx軸に沿って線形補間したものと、(x, 1, 0)をx軸に沿って線形補間したものを、y軸に沿って線形補間
  float z0 = mix(mix(dh0, dh1, w.x), mix(dh2, dh3, w.x), w.y);
  
  // z = 1 の面
  // (x, 0, 1)をx軸に沿って線形補間したものと、(x, 1, 1)をx軸に沿って線形補間したものを、y軸に沿って線形補間
  float z1 = mix(mix(dh4, dh5, w.x), mix(dh6, dh7, w.x), w.y);
  
  // z = 0 の面と z = 1 の面をz軸に沿って線形補間
  float i = mix(z0, z1, w.z);
  
  return i;
}


void main(){
  if (aAge >= aLife) {
    /* パーティクルの寿命が尽きたので、古い粒子の代わりに新しい粒子を生成 */
    
    // 乱数生成
    vec2 noiseCoord = vec2(gl_VertexID % 512, gl_VertexID / 512);
    vec2 rand = hash22(noiseCoord);

    // 1つ目の乱数値rand.xに基づいてパーティクルの方向を決定
    // 方向は、そのベクトルがベクトル（1，0）となす角度θによって決定される。
    float theta = uMinTheta + rand.x * (uMaxTheta - uMinTheta);

    // 方向単位ベクトルのx成分、y成分を導出
    float x = cos(theta);
    float y = sin(theta);

    // 粒子を原点に配置
    vPosition = uOrigin;

    // 生まれたばかりなので0歳に設定
    vAge = 0.0;
    // 寿命を設定
    vLife = aLife;

    // 2つ目のランダム値rand.yを使って速度をランダム化
    vVelocity = vec2(x, y) * (uMinSpeed + rand.y * (uMaxSpeed - uMinSpeed));

  } else {
    /** 簡単なルールに従って、パラメータを更新 **/
    
    vec2 force = 4.0 * vec2(pnoise31(vec3(aPosition, uTime)), pnoise31(vec3(aPosition + 700.0, uTime)));
    
    vPosition = aPosition + aVelocity * uTimeDelta;
    vAge = aAge + uTimeDelta;
    vLife = aLife;
    vVelocity = aVelocity + uGravity * uTimeDelta + force * uTimeDelta;
  }
}