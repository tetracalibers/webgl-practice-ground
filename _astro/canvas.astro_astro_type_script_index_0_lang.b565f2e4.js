import{S as i,P as l}from"./program.2ef84f69.js";const g=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,v=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0, 0.0, 0.5, 1.0);
}`;window.onload=()=>{const o=new i("gl-canvas"),t=o.canvas,n=o.gl;if(!t||!n)return;const e=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const r=new l(n,g,v),s=[],c=[];r.load(s,c)},a=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{e(),a()})()};
