---
title: ライティング
category: CG
---

## フォンライティングモデル

このモデルでは、表面で反射した光を、次の3つの項を足し合わせたものとしてモデル化する。

### アンビエント項

シーン中の間接的に跳ね返る光の量を、全体として近似したもの。

シーン全体のライティングのレベルをモデル化する。

間接的な跳ね返りがあることで、影になっている領域も完全な黒にはならない。

### ディフューズ（拡散）項

各光源から直接来て全方向に均一に反射する光を記述する。

光沢のない表面での現実の光の反射をうまくモデル化できる。

### スペキュラー（鏡面反射）項

光沢のある表面で見られる明るいハイライトをモデル化する。

スペキュラーハイライトは、光源が直接反射する角度と視角が近い場合に起こる。

### フォン反射の計算

- 視線方向ベクトル$\bold{V}$（カメラのfrontベクトルの逆ベクトル。反射点から仮想カメラの焦点に伸びる）
- ambientの明るさ$\bold{A} = (A_R, A_G, A_B)$
- 光が表面に当たる点での面法線$\bold{N}$
- ambientの反射率$\bold{k}_A = (k_{A_R}, k_{A_G}, k_{A_B})$
- diffuseの反射率$\bold{k}_D = (k_{D_R}, k_{D_G}, k_{D_B})$
- specularの反射率$\bold{k}_S = (k_{S_R}, k_{S_G}, k_{S_B})$
- specularの光沢度の指数$\alpha$
- 光源$i$の色味と明るさ$\bold{C}_i = (C_{iR}, C_{iG}, C_{iB})$
- 光源$i$の反射点からの方向ベクトル$\bold{L}_i$

ある点で反射した光の明るさ$\bold{I}$は、以下のベクトル方程式で表される。

$$
\bold{I}_{RGB} = (\bold{k}_A \otimes \bold{A}) + \sum_i (\bold{k}_D(\bold{N} \cdot \bold{I}_i) + \bold{k}_S(\bold{R}_i \cdot \bold{V})^\alpha) \otimes \bold{C}_i
$$

反射点からの方向ベクトル$\bold{L}$は、表面の接線方向$\bold{L}_T$と接平面上の法線方向$\bold{L}_N$に分解できる。

$$
\bold{L} = \bold{L}_N + \bold{L}_T
$$

内積$(\bold{N}\cdot\bold{L})$は、表面と直交する$\bold{L}$の射影を表す。

そのため、法線成分$\bold{L}_N$は、単位法線ベクトル$\bold{N}$にこの内積をかけたものになる。

$$
\bold{L}_N = (\bold{N} \cdot \bold{L})\bold{N}
$$

ベクトル$\bold{R}_i = (R_{ix}, R_{iy}, R_{iz})$は、光線の方向ベクトル$\bold{L}_i$の反射である。

反射ベクトル$\bold{R}$は、$\bold{L}$と同じ法線成分を持つが、接線成分は反対向きとなる。

したがって、$\bold{R}$は次のように求められる。

$$
\begin{align*}
\bold{R} &= \bold{L}_N - \bold{L}_T \\
 &= \bold{L}_N - ( \bold{L} - \bold{L}_N ) \\
  &= 2\bold{L}_N - \bold{L} \\
\bold{R}_i &= 2(\bold{N} \cdot \bold{L})\bold{N} - \bold{L}_T
\end{align*}
$$

## ブリン・フォンライティングモデル

