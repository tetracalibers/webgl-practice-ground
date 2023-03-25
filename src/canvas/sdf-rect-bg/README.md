## 矩形SDFのロジックを追う

### 矩形の外部

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(point);
}
```

![](/src/canvas/sdf-rect-bg/doc/01.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(point - dist);
}
```

![](/src/canvas/sdf-rect-bg/doc/02.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return max(point - dist, vec2(0.0)).x;
}
```

![](/src/canvas/sdf-rect-bg/doc/03.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return max(point - dist, vec2(0.0)).y;
}
```

![](/src/canvas/sdf-rect-bg/doc/04.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(max(point - dist, vec2(0.0)));
}
```

![](/src/canvas/sdf-rect-bg/doc/05.png)

### 矩形の内部

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return point.x - dist.x;
}
```

![](/src/canvas/sdf-rect-bg/doc/06.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return point.y - dist.y;
}
```

![](/src/canvas/sdf-rect-bg/doc/07.png)


```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return max(point.x - dist.x, point.y - dist.y);
}
```

![](/src/canvas/sdf-rect-bg/doc/08.png)

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return min(max(point.x - dist.x, point.y - dist.y), 0.0);
}
```

![](/src/canvas/sdf-rect-bg/doc/09.png)

### 外部 + 内部

```glsl
// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(max(point - dist, vec2(0.0))) + min(max(point.x - dist.x, point.y - dist.y), 0.0);
}
```

![](/src/canvas/sdf-rect-bg/doc/10.png)