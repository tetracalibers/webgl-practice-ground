---
title: mix-blend-mode比較考察
category: image
---

GLSLでmix-blend-modeを再現実装した比較デモは[こちら](/webgl-practice-ground/compare-blend-effect-image/)

## add

```glsl
// 和
finalColor = background + foreground;
```

- CSSのmix-blend-modeには存在しない
- 合成結果は必ず明るくなる
- 画像の明るさにもよるが、ほとんどの領域が白（最大値超え）になってしまう

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/add-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/add-02.png" />
    </td>
  </tr>
</table>

## subtract

```glsl
// 差
finalColor = background - foreground;
```

- 合成結果は必ず暗くなる
- 前景の方が背景より暗い場合、合成結果は黒（最小値以下）になってしまう
- R,G,Bいずれかが0（以下）になってしまうことが多いため、原色（赤 or 緑）が目立つ

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/subtract-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/subtract-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/subtract-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/subtract-04.png" />
    </td>
  </tr>
</table>

## difference

```glsl
// 差の絶対値
finalColor = abs(background - foreground);
```

- 背景と前景の明暗差が大きいほど、結果は明るくなる
- 背景が明るいと、赤と緑ばかりが目立って中途半端な結果になりがち？
- 背景が暗いと、レトロな感じが出せる
- subtractでは黒になってしまう部分が、鮮やかな色になる

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/difference-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/difference-02.png" />
    </td>
  </tr>
</table>

## lighten

```glsl
// 明るい方の色
finalColor = max(background, foreground);
```

- 前景の、背景より暗い部分が透明になる
- 全体的に明暗差が大きいと、明るい方だけが残ってしまう
- 明暗が近い色だと綺麗に混ざる印象

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/lighten-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/lighten-04.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/lighten-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/lighten-02.png" />
    </td>
  </tr>
</table>

## darken

```glsl
// 暗い方の色
finalColor = min(background, foreground);
```

- 前景の明るい部分が透明になる
- 全体的に明暗差が大きいと、暗い方だけが残ってしまう
- 明るい色同士で明暗が近いと、輪郭（不透明部分との境界）が目立ってしまう印象

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/darken-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/darken-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/darken-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/darken-04.png" />
    </td>
  </tr>
</table>

## multiply

```glsl
// 積
finalColor = background * foreground;
```

- 背景が明るい場合、背景も前景も元の色味からあまり変わらずに済む印象
- 前景は元の色味からはやや暗くなる
- 背景が暗いと、前景は暗くなるどころか溶け込んでしまう
- 前景が明るめだと、輪郭（不透明部分との境界）が目立ちがち

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/multiply-04.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/multiply-03.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/multiply-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/multiply-02.png" />
    </td>
  </tr>
</table>

## screen

```glsl
// 反転した状態で乗算し、再度反転して戻す
finalColor = 1.0 - (1.0 - background) * (1.0 - foreground);
```

- multiplyの逆に近い
- 背景が暗い場合、背景も前景も元の色味からあまり変わらずに済む印象
- 前景は元の色味からはやや明るくなる
- 背景が明るいと、前景はパステルカラーのような色味になって溶け込む

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/screen-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/screen-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/screen-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/screen-04.png" />
    </td>
  </tr>
</table>

## overlay

```glsl
// 背景の明度（求め方は色空間によっていろいろ？）
float brightness = max(background.r, max(background.g, background.b));

// 背景の明度が0.5以下かどうかで分岐
finalColor = mix(
  // 0.5以下であれば、係数2倍でmultiply
  2.0 * background * foreground,
  // 0.5より大きければ、係数2倍でscreen
  1.0 - 2.0 * (1.0 - background) * (1.0 - foreground),
  // 
  step(0.5, brightness)
);
```

- screenよりもコントラストが上がる
- 暗い背景に薄い前景が重なる箇所は、背景が染み出してしまう

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/overlay-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/overlay-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/overlay-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/overlay-04.png" />
    </td>
  </tr>
</table>

## color-dodge（覆い焼き）

```glsl
finalColor = background / (1.0 - foreground);
```

- 前景の各部分の色の差がわかりづらくなる
- 背景が暗いと、ステンドグラスのように鮮やかになる

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-dodge-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-dodge-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-dodge-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-dodge-04.png" />
    </td>
  </tr>
</table>

## color-burn（焼き込み）

```glsl
finalColor = 1.0 - (1.0 - background) / foreground;
```

<table>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-burn-01.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-burn-02.png" />
    </td>
  </tr>
  <tr>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-burn-03.png" />
    </td>
    <td>
      <img src="/webgl-practice-ground/note/mix-blend-mode/color-burn-04.png" />
    </td>
  </tr>
</table>

## hard-light

TODO: 数式調べて考察する

## soft-light

TODO: 数式調べて考察する