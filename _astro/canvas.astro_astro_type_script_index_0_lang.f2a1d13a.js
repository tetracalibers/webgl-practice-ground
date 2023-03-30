import{S as l,P as x}from"./program.2ef84f69.js";import{U as g}from"./uniform-reflect.63d9f660.js";const u=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,v=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

float plot(vec2 xy) {
  // smoothstep(a, b, x)
  // * x < a の場合、 0
  // * a <= x <= b の場合、t^2(3 - 2t), t = (x - a)/(b - a)
  // * x > b の場合、 1
  
  // 0.0～1.0までの値を用いてyに線を引く
  // * 線の太さを0.005で制御している
  // * xy.y - xy.xは、[-1.0, 1.0]
  // * => 絶対値を取ることで、[0.0, 1.0]に
  return smoothstep(0.005, 0.0, abs(xy.y - xy.x));
}

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  // smoothstepの性質より、[0, 1]の範囲内
  float graph = plot(xy);
  
  // graphに沿って線形補間
  // * mix(背景色, グラフの色, ...)
  vec3 color = mix(vec3(xy.x), vec3(0.0, 1.0, 1.0), graph);
  
  outColor = vec4(color, 1.0);
}`;window.onload=()=>{const o=new l("gl-canvas"),r=o.canvas,n=o.gl;if(!r||!n)return;let t;const a=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const e=new x(n,u,v),c=[],i=["uResolution"];e.load(c,i),t=new g(n,e)},s=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),t.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{a(),s()})()};
