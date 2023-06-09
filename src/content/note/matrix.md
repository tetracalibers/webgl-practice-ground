---
title: 行列
category: math
---

## 正規直交行列

3x3行列にあるすべての行や列ベクトルが単位長であるとき、その行列は**特殊直交行列**（**等方行列**、**正規直交行列**）などと呼ばれる。

### 転置行列と逆行列

正規直交行列の転置行列は、逆行列と等しい。

（一般的に、逆行列を見つけるよりも行列を転置する方が簡単である。）

## 行列の積

行列の積は、左の行列の列ベクトルと右の行列の行ベクトルの内積をとったものを並べたものとして定義される。

### ベクトルと行列の積の順序

ベクトルと行列の積は、ベクトルを行ベクトルとして扱うか列ベクトルとして扱うかによって、結果が異なる。

- 行ベクトルに行列をかけるとき、行ベクトルは左からかける
- 列ベクトルに行列をかけるとき、列ベクトルは右からかける

これらは、行列を転置することによって、相互に変換できる。

## 回転行列

2次元行ベクトル$\bold{v}$を$\phi$度回転させるには、次のように計算すればよい。

$$
\bold{v'} = (v_x, v_y) \begin{pmatrix}
\cos \phi & \sin \phi \\
-\sin \phi & \cos \phi
\end{pmatrix}
$$

これは、$z$軸周りの3次元の回転であることから、3次元の回転行列を使って次のように表すこともできる。

$$
\bold{v'} = (v_x, v_y, v_z) \begin{pmatrix}
\cos \phi & \sin \phi & 0 \\
-\sin \phi & \cos \phi & 0 \\
0 & 0 & 1
\end{pmatrix}
$$

## 同次座標

3x3行列を使って、平行移動を表現することはできない。

そこで、4x4行列を使って、平行移動を表現する。

### 平行移動のための4x4行列

回転の効果はいらないため、左上の3x3行列は単位行列でなければならない。

そして、平行移動の効果を表すために、左下の1x3行列に平行移動量を入れる。

平行移動させたいベクトル$\bold{v}$に、4つめの成分$w$を追加し、これを1としておく。

平行移動量を$\bold{t}$とすると、次のように表すことができる。

$$
\begin{align*}
\bold{v} + \bold{t} &= (v_x, v_y, v_z, 1) \begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
t_x & t_y & t_z & 1
\end{pmatrix} \\
&= (v_x + t_x, v_y + t_y, v_z + t_z, 1)
\end{align*}
$$

ベクトルが3次元から4次元へ拡張されるとき、これは**同次座標**で書かれたという。

同次座標では、座標点は$w$成分が1に等しくなるものとして定義する。

### 方向ベクトルの変換

方向ベクトルに平行移動を適用すると、その大きさや向きは変わってしまう。

そのため、方向ベクトルを変換するときは、平行移動する効果を持たないようにする必要がある。

そこで、同次座標では、方向ベクトルを$w$成分が0に等しくなるものとして定義する。

$w = 0$とすることで、次のように、平行移動の効果を打ち消すことができる。

$$
(\bold{v}, 0) = \begin{pmatrix}
\bold{R} & 0 \\
\bold{t} & 1
\end{pmatrix} = (\bold{v}\bold{R} + 0\bold{t}, 0)
$$

### 同次座標と非同次座標の変換

同次座標における座標点は、$x$, $y$, $z$成分をそれぞれ$w$成分で割って、非同次座標に変換することができる。

$$
(x, y, z, w) \rightarrow \left(\frac{x}{w}, \frac{y}{w}, \frac{z}{w}\right)
$$

$w = 1$である場合、同次座標と非同次座標は等しい。

一方、$w = 0$である場合、同次座標は無限遠点を表す。

4Dの無限遠点は、どんな平行移動をしようとしても無限遠点に留まるため、回転することはできるが、平行移動することはできない。

つまり、3Dの方向ベクトルは、4D同次座標にある無限遠点として振る舞う。

## アフィン行列

直線の平行性や相対距離比を保つ変換を表す行列は、**アフィン行列**と呼ばれる。

どのアフィン変換行列も、平行移動、回転、スケーリング、せん断を表す4x4行列を連結するだけで生成することができる。

$$
\bold{M}_{affine} = \begin{pmatrix}
  \bold{R}_{3 \times 3} & \bold{0} \\
  \bold{t}_{1 \times 3} & 1
\end{pmatrix}
$$

- $\bold{R}$は回転やスケーリングを表す行列
- $\bold{t}$は平行移動ベクトル

最も右の列ベクトルは、常に$(0, 0, 0, 1)^T$であるため、この列を省略した4x3行列を使ってメモリを節約することもある。

## 回転行列

$x$軸回りで角度$\phi$の回転を表す行列は次のようになる。

$$
\bold{R}_x = \begin{pmatrix}
1 & 0 & 0  & 0\\
0 & \cos \phi & \sin \phi & 0 \\
0 & -\sin \phi & \cos \phi  & 0\\
0 & 0 & 0 & 1
\end{pmatrix}
$$

$y$軸回りで角度$\phi$の回転を表す行列は次のようになる。

$$
\bold{R}_y = \begin{pmatrix}
\cos \phi & 0 & -\sin \phi & 0 \\
0 & 1 & 0 & 0 \\
\sin \phi & 0 & \cos \phi & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

$z$軸回りで角度$\phi$の回転を表す行列は次のようになる。

$$
\bold{R}_z = \begin{pmatrix}
\cos \phi & \sin \phi & 0 & 0 \\
-\sin \phi & \cos \phi & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

### 逆行列

回転行列の逆行列は、反対回りの回転を表す行列。

$\sin(-\theta) = -\sin(\theta)$であるため、角度を符号反転させると、正弦項の位置が入れ替わる。

このため、回転行列の逆行列は、転置行列となる。

## スケーリング行列

スケーリングを表す行列は次のようになる。

$$
\bold{S} = \begin{pmatrix}
s_x & 0 & 0 & 0 \\
0 & s_y & 0 & 0 \\
0 & 0 & s_z & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

### 逆行列

スケーリング係数をすべて逆数にするだけで、逆行列を得ることができる。

