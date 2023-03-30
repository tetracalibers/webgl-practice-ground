import{S as l,P as f}from"./program.2ef84f69.js";import{U as g}from"./uniform-reflect.63d9f660.js";const p=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,u=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// fnのグラフをxy平面上に描く
float plot(vec2 xy, float fn) {
  // smoothstepはどちらも fn > y の領域を塗りつぶす
  // ちょっとずらして引くことで、線だけを残す
  // 0.01が線の太さを司っている
  return smoothstep(fn - 0.01, fn, xy.y) - smoothstep(fn, fn + 0.01, xy.y);
}

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  // pow(a, r) = a^r
  float fn = pow(xy.x, 5.0);
  
  float graph = plot(xy, fn);
  
  // graphに沿って線形補間
  // * mix(背景色, グラフの色, ...)
  // * 背景色はfnによるイージング
  vec3 color = mix(vec3(fn), vec3(0.0, 1.0, 1.0), graph);
  
  outColor = vec4(color, 1.0);
}`;window.onload=()=>{const o=new l("gl-canvas"),r=o.canvas,n=o.gl;if(!r||!n)return;let t;const a=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const e=new f(n,p,u),c=[],i=["uResolution"];e.load(c,i),t=new g(n,e)},s=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),t.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{a(),s()})()};
