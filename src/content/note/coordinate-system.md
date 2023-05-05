---
title: 座標系
category: math
---

## 円筒座標 - Cylindrical Coordinates

点Pは3つの数字$(P_h, P_r, P_{\theta})$で表される。

- 垂直の高さ位置である$h$
- 垂直線とヨー角$\theta$から生じる放射軸の$r$

![](/webgl-practice-ground/note/coordinate/Cylindrical-Coordinates.svg)

## 球座標

点Pは3つの数字$(P_r, P_{\phi}, P_{\theta})$で表される。

- ピッチ角の$\phi$
- ヨー角の$\theta$
- 半径の$r$

![](/webgl-practice-ground/note/coordinate/Spherical-Coordinates.svg)

## 右手座標系と左手座標系

### 違い

$y$軸が上を向いて$x$軸が右を向いているとき、

- $z$軸が手前を向いている座標系が**右手座標系**
- $z$軸が奥を向いている座標系が**左手座標系**

### 変換

どれか一つの軸の方向を反転させ、他の2つの軸はそのままにする。

### 3Dグラフィックスでは左手座標系

$z$軸は視聴者から向こう（バーチャルカメラが指し示す方向）を向くと都合が良い。

$z$座標が増加するとスクリーンの深さが増加する（バーチャルカメラから離れていく）ことが必要になる局面があるため。

- 深度による陰面消去のためにzバッファリング方式を使うとき

etc.