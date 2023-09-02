#version 300 es

/**

この頂点シェーダを呼び出すたびに、対応するパーティクルを1つだけ更新する

- in : システム内のパーティクルの現在の状態
- out: 指定された時間が経過した後のパーティクルの更新された状態を含むバッファを生成

**/

// 粒子がどこにあるか
layout (location = 0) in vec2 aPosition;
// 粒子の年齢（秒）
layout (location = 1) in float aAge;
// 粒子の寿命（秒）
layout (location = 2) in float aLife;
// 粒子がどこに向かうのか、どのくらいの速さで向かうのか
layout (location = 3) in vec2 aVelocity;

out vec2 vPosition;
out vec2 vVelocity;
out float vAge;
out float vLife;

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
    
    vPosition = aPosition + aVelocity * uTimeDelta;
    vAge = aAge + uTimeDelta;
    vLife = aLife;
    vVelocity = aVelocity + uGravity * uTimeDelta;
  }
}