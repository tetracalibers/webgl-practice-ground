---
title: GLSLのフラグメント座標正規化いろいろ
---

# 前提となる数学

## 正規化

正規化は、一定のルールに基づいて、データを都合の良い形に整えること。

GLSLの場合、色は[0, 1]区間、座標は[0, 1]や[-1, 1]などの区間内の数値として扱うことが多い。

そのため、ここでいう正規化とは、ある値を[0, 1]範囲に収まる値（割合）に変換することだとする。

[a, b]範囲内にAという値がある。

このとき、[a, b]区間全体に対するAの割合は、

- [a, b]範囲の幅 = b - a（全体）
- [a, A]範囲の幅 = A - a（Aの値）

より、$\frac{(A - a)}{(b - a)}$

```glsl
float _norm(float v, float min, float max) {
  return (v - min) / (max - min);
}
```

GLSLに用意されている関数と区別するため、自作関数には`_`をつけることにする。

## 線形補間

範囲と割合を渡すと、その割合の位置にある値を返す機能を線形補間という。

範囲に割合をかければ、その割合の「位置」は求まる。

範囲の下限が0でないならば、その位置の「値」は下限を足したものになるはずだ。

```glsl
float _lerp(float min, float max, float t) {
  return min + (max - min) * t;
}
```

ちょっと式変形すると、

```
  min + max * t - min * t
= min * 1 - min * t + max * t
= (1 - t) * min + t * max
```

## マップ

GLSLを触っていると、ある範囲内での位置（値）が、別の範囲内ではどの位置（値）に対応するのか、を知りたくなる機会がある。

例えば、[0, 100]区間内の50の位置は、[0, 10]区間内での5の位置に対応する。

[a, b]範囲内のAの位置が、[x, y]範囲内のXという位置に対応するとする。

まず、[a, b]区間に対するAの割合Mは、`norm(A, a, b)`で求まる。

そして、[x, y]範囲内で、割合がMとなる値は、`lerp(x, y, M)`で求まる。

```glsl
float _map(float v, float min1, float max1, float min2, float max2) {
  return _lerp(min2, max2, _norm(v, min1, max1));
}
```

# フラグメント座標の変換いろいろ

## [0, 1]範囲の値に

`[0, uResolution.x]`範囲内の値`gl_FragCoord.x`は、[0, 1]範囲内では？

```glsl
vec2 pos = _norm(gl_FragCoord.x, 0, uResolution.x);
// i.e.
pos = gl_FragCoord.x / uResolution.x;
```

このような計算をx, yそれぞれに行うのが、次の正規化計算である。

```glsl
// フラグメント座標を正規化
// * 割合なので、[0, 1]の範囲になる
vec2 pos = gl_FragCoord.xy / uResolution.xy;
```

## [0, 1]範囲の値に - アスペクト比による歪み防止

`uResolution.x`と`uResolution.y`が異なる（=キャンバスが正方形でない）場合、`gl_FragCoord`

```glsl
// x, yを同じ値で割ることで、画面の縦横比に応じて歪むことがなくなる
vec2 pos = gl_FragCoord.xy / min(uResolution.x, uResolution.y);
```

### [-1, 1]

`[0, uResolution.x]`範囲内の値`gl_FragCoord.x`は、[-1, 1]範囲内では？

例えば、500x300のキャンバスに点(5, 5)があるとする。
このとき、普通に正規化すると、(5 / 500, 5 / 300) = (0.01, 0.016...)となる。
原点との四角形を考えると、(5, 5)の場合は正方形で済むのに、(0.01, 0.016...)の場合は縦長長方形になってしまう。

これがアスペクト比による歪み。このような歪みを防ぐためには、xもyも同じ値で割れば良い。
キャンバス幅とキャンバス高さ、どちらで割っても良いが、小さい方に合わせるのが主流だ。

```glsl
vec2 pos = _map(gl_FragCoord.x, 0, uResolution.x, -1, 1);
// i.e.
pos = _lerp(-1, 1, _norm(gl_FragCoord.x, 0, uResolution.x));
// i.e.
pos = _lerp(-1, 1, gl_FragCoord.x / uResolution.x);
// i.e.
pos = -1 + (uResolution.x + 1) * gl_FragCoord.x / uResolution.x;
pos = -1 + gl_FragCoord.x + gl_FragCoord.x / uResolution.x;
```

```glsl
// ビューポートの中心を原点としてスケール
vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);

pos = 2.0 * gl_FragCoord.xy / min - uResolution.xy / min;
```

```glsl
// フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  // フラグメント座標範囲を[-1, 1]区間に変換
  // * 元々、フラグメント座標は第一象限内[0, 1]
  // * 2倍することで、[0, 2]に
  // * 1を引くことで、[-1, 1]に
  pos = 2.0 * pos.xy - vec2(1.0);
```