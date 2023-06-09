---
title: 座標空間
category: math
---

## モデル空間（オブジェクト空間、ローカル空間）

頂点の位置ベクトルは、**モデル空間**（**ローカル空間**、**オブジェクト空間**）と呼ばれる局所的な座標系に関する相対位置で定義される。

通常、原点はオブジェクトの中心とする。

軸は、モデルに対して自然な「前」、「上」、「右」（「左」）の方向に指定する。

- front：オブジェクトが自然に進む方向、向く方向
- up：オブジェクトの頂上を指す軸
- left/right：オブジェクトの左側または右側（右手座標系か左手座標系かによってどちらを使うか決める）

## ワールド空間

ワールド空間は固定の座標空間であり、すべてのオブジェクトの位置、向き、スケーリングが表現されている。

## ビュー空間（カメラ空間）

カメラに固定された座標空間であり、原点はカメラの位置となる。

右手系になるように定義した場合、カメラは$z$軸の負の方向を向き、$z$座標は負の奥行きを表す。

## 基底変換行列

任意の子座標系$C$からその親座標系$P$に座標や姿勢を変換する行列は$M_{C\rightarrow P}$と書くことができる。

任意の子空間位置ベクトル$P_C$は以下のように親空間ベクトル$P_{P}$に変換される。

$$
\begin{align*}
P_{P} &= P_{C}M_{C\rightarrow P} \\
M_{C\rightarrow P} &= \begin{pmatrix}
i_{Cx} & i_{Cy} & i_{Cz} & 0 \\
j_{Cx} & j_{Cy} & j_{Cz} & 0 \\
k_{Cx} & k_{Cy} & k_{Cz} & 0 \\
t_{Cx} & t_{Cy} & t_{Cz} & 1
\end{pmatrix}
\end{align*}
$$

- $\bold{i}_C$は親空間の座標で表された子空間の$x$軸の単位規定ベクトル
- $\bold{j}_C$は親空間の座標で表された子空間の$y$軸の単位規定ベクトル
- $\bold{k}_C$は親空間の座標で表された子空間の$z$軸の単位規定ベクトル
- $\bold{t}_C$は子の座標系を親空間に平行移動するもの

単位基底ベクトルを適切にスケーリングするだけで、子座標系をスケーリングすることができる。

## 法線ベクトルの変換

法線ベクトルは、位置ベクトルとは異なり、変換行列の逆転置をかける必要がある。

$M_{A\rightarrow B}$に非一様スケーリングやせん断が含まれる（直交ではない）場合、表面とベクトルの角度は空間$A$から空間$B$に動くときには維持されない。

逆転置行列の操作が、この歪みを相殺する。
