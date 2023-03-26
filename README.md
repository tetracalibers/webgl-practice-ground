## 構成

```
src
├── canvas（描画サンプル）
│   └── *
│       ├── canvas.astro（canvas要素とその描画処理）
│       ├── doc（アルゴリズムノート）
│       ├── index.frag（フラグメントシェーダ）
│       └── index.vert（頂点シェーダ）
├── content（ページのコンテンツ）
│   ├── config.ts（フロントマター型定義）
│   └── study（描画サンプル表示ページのコンテンツ）
│       └── *.mdx
├── layout（ページの枠組み）
├── lib（オレオレヘルパーライブラリ）
│   ├── canvas（canvas要素とそのコンテキストの操作）
│   │   └── index.ts
│   ├── control（ユーザ操作や状態の管理）
│   │   ├── mouse-coords.ts（マウス座標の管理）
│   │   └── timer.ts（経過時間の管理）
│   ├── event（イベント処理）
│   │   ├── clock.ts（レンダーループの管理）
│   │   └── event-emitter.ts（独自イベント制御）
│   ├── gui（GUIコントロールの作成と操作）
│   ├── math（数学演算）
│   │   ├── matrix.ts（行列）
│   │   ├── quaternion.ts（クォータニオン）
│   │   ├── radian.ts（角度）
│   │   └── vector.ts（ベクトル）
│   ├── shader（シェーダのコンパイル）
│   │   └── compile.ts
│   └── webgl（WebGLヘルパー）
│       ├── camera.ts（カメラ）
│       ├── program.ts（シェーダとプログラム）
│       ├── scene.ts（描画オブジェクトの管理）
│       ├── shader-data.type.ts（ユニフォーム/アトリビュート関連の型）
│       ├── transforms.ts（座標変換）
│       └── uniform-reflect.ts（ユニフォーム変数をシェーダに送る）
└── pages（ページ）
    ├── [slug].astro（各描画サンプル表示ページ）
    └── index.astro（目次ページ）
```

## コンテンツ

- [hsv2rgbのロジックを追う](/src/canvas/hsv-color-space-bg/doc/hsv2rgb.md)
- [矩形のSDFのロジックを追う](/src/canvas/sdf-rect-bg)
- [マンハッタン距離による円のSDFと等高線](/src/canvas/sdf-circle-manhattan-distance)
- [チェビシェフ距離による円のSDFと等高線](/src/canvas/sdf-circle-chebyshev-distance)